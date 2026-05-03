'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Seat, { type Profile } from './Seat'
import CoffeeBreakArea from './CoffeeBreakArea'
import MessagePopup from './MessagePopup'
import MessageNotification from './MessageNotification'
import ProfileModal from '@/components/profile/ProfileModal'

interface SeatRow {
  id: number
  occupied_by: string | null
  occupied_at: string | null
  profiles: Profile | null
}

interface RoomUser {
  id: string
  display_name: string
  avatar_color: string
}

interface Notification {
  id: string
  senderName: string
  text: string
}

interface CurrentUser {
  id: string
  display_name: string
  username: string
  avatar_color: string
  in_coffee_break: boolean
  created_at: string
}

interface StudyRoomProps {
  currentUser: CurrentUser
  initialSeats: SeatRow[]
  initialCoffeeBreakUsers: RoomUser[]
}

export default function StudyRoom({ currentUser, initialSeats, initialCoffeeBreakUsers }: StudyRoomProps) {
  const [seats, setSeats] = useState<SeatRow[]>(initialSeats)
  const [coffeeBreakUsers, setCoffeeBreakUsers] = useState<RoomUser[]>(
    initialCoffeeBreakUsers.filter((u) => u.id !== currentUser.id)
  )
  const [ownInCoffeeBreak, setOwnInCoffeeBreak] = useState(currentUser.in_coffee_break)
  const [ownProfile, setOwnProfile] = useState({
    id: currentUser.id,
    display_name: currentUser.display_name,
    avatar_color: currentUser.avatar_color,
    created_at: currentUser.created_at,
  })

  const [messageTarget, setMessageTarget] = useState<{ id: string; display_name: string } | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [profileOpen, setProfileOpen] = useState(false)
  const [tasksDoneCount, setTasksDoneCount] = useState(0)

  const supabase = createClient()
  const ownSeatId = seats.find((s) => s.occupied_by === currentUser.id)?.id ?? null

  // Fetch tasks done count for profile modal
  const fetchTasksDone = useCallback(async () => {
    const { count } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', currentUser.id)
      .eq('done', true)
    setTasksDoneCount(count ?? 0)
  }, [supabase, currentUser.id])

  // Real-time: seats + profiles + messages
  useEffect(() => {
    const seatsChannel = supabase
      .channel('seats-presence')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'seats' },
        async (payload) => {
          const updated = payload.new as { id: number; occupied_by: string | null; occupied_at: string | null }
          let profile: Profile | null = null
          if (updated.occupied_by) {
            const { data } = await supabase
              .from('profiles')
              .select('id, display_name, username, avatar_color, in_coffee_break')
              .eq('id', updated.occupied_by)
              .single()
            profile = data
          }
          setSeats((prev) =>
            prev.map((s) =>
              s.id === updated.id
                ? { ...s, occupied_by: updated.occupied_by, occupied_at: updated.occupied_at, profiles: profile }
                : s
            )
          )
        }
      )
      .subscribe()

    const profilesChannel = supabase
      .channel('profiles-presence')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const updated = payload.new as { id: string; display_name: string; avatar_color: string; in_coffee_break: boolean }
          if (updated.id === currentUser.id) {
            setOwnInCoffeeBreak(updated.in_coffee_break)
            return
          }
          if (updated.in_coffee_break) {
            setCoffeeBreakUsers((prev) =>
              prev.some((u) => u.id === updated.id)
                ? prev.map((u) => u.id === updated.id ? { ...u, display_name: updated.display_name, avatar_color: updated.avatar_color } : u)
                : [...prev, { id: updated.id, display_name: updated.display_name, avatar_color: updated.avatar_color }]
            )
          } else {
            setCoffeeBreakUsers((prev) => prev.filter((u) => u.id !== updated.id))
          }
        }
      )
      .subscribe()

    const messagesChannel = supabase
      .channel('messages-inbox')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${currentUser.id}` },
        async (payload) => {
          const msg = payload.new as { id: string; sender_id: string; text: string }
          // Look up sender name from local state first, fallback to fetch
          const inSeat = seats.find((s) => s.occupied_by === msg.sender_id)?.profiles
          const inCoffeeBreak = coffeeBreakUsers.find((u) => u.id === msg.sender_id)
          let senderName: string = inSeat?.display_name ?? inCoffeeBreak?.display_name ?? ''
          if (!senderName) {
            const { data } = await supabase.from('profiles').select('display_name').eq('id', msg.sender_id).single()
            senderName = data?.display_name ?? 'Someone'
          }
          setNotifications((prev) => {
            const newNotif = { id: msg.id, senderName, text: msg.text }
            const updated = [newNotif, ...prev]
            return updated.slice(0, 3)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(seatsChannel)
      supabase.removeChannel(profilesChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [supabase, currentUser.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Claim a seat
  async function claimSeat(seatId: number) {
    // Release current seat first (occupied_by has a UNIQUE constraint)
    if (ownSeatId !== null) {
      await supabase.from('seats').update({ occupied_by: null, occupied_at: null }).eq('id', ownSeatId)
    }
    // Clear coffee break
    setOwnInCoffeeBreak(false)
    await supabase.from('profiles').update({ in_coffee_break: false }).eq('id', currentUser.id)
    // Claim new seat (all 8 rows always exist, so update is safe)
    await supabase.from('seats').update({ occupied_by: currentUser.id, occupied_at: new Date().toISOString() }).eq('id', seatId)
  }

  // Move to coffee break
  async function goToCoffeeBreak() {
    if (ownSeatId !== null) {
      await supabase.from('seats').update({ occupied_by: null, occupied_at: null }).eq('id', ownSeatId)
    }
    await supabase.from('profiles').update({ in_coffee_break: true }).eq('id', currentUser.id)
    setOwnInCoffeeBreak(true)
    setCoffeeBreakUsers((prev) =>
      prev.some((u) => u.id === currentUser.id)
        ? prev
        : [...prev, { id: currentUser.id, display_name: ownProfile.display_name, avatar_color: ownProfile.avatar_color }]
    )
  }

  function handleSeatClick(seat: SeatRow) {
    if (!seat.occupied_by) {
      claimSeat(seat.id)
    } else if (seat.occupied_by !== currentUser.id && seat.profiles) {
      setMessageTarget({ id: seat.occupied_by, display_name: seat.profiles.display_name })
    }
    // own seat: no-op
  }

  async function sendMessage(text: string) {
    if (!messageTarget) return
    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      recipient_id: messageTarget.id,
      text,
    })
  }

  function dismissNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  async function handleProfileSave(updates: { display_name: string; avatar_color: string }) {
    await supabase.from('profiles').update(updates).eq('id', currentUser.id)
    setOwnProfile((prev) => ({ ...prev, ...updates }))
    // Update own avatar in coffee break list if present
    setCoffeeBreakUsers((prev) =>
      prev.map((u) => u.id === currentUser.id ? { ...u, ...updates } : u)
    )
  }

  function openProfile() {
    fetchTasksDone()
    setProfileOpen(true)
  }

  return (
    <div className="relative">
      {/* Room — warm golden-green library, top-down view */}
      <div
        className="relative rounded-3xl p-6 w-fit mx-auto shadow-xl"
        style={{ background: 'linear-gradient(160deg, #d8e8c2 0%, #c9d9a8 100%)', border: '3px solid #b5c98a' }}
      >
        {/* Room label + own name clickable */}
        <div className="text-center mb-4 flex items-center justify-center gap-2">
          <span className="text-xs font-bold tracking-widest uppercase text-[#7a9a50]/80">✨ Study Hall ✨</span>
          <button
            onClick={openProfile}
            className="text-xs font-bold text-[#4a3728]/60 hover:text-[#4a3728] transition-colors underline-offset-2 hover:underline"
          >
            {ownProfile.display_name}
          </button>
        </div>

        {/* Top row of seats */}
        <div className="flex gap-4 mb-4 justify-center">
          {seats.slice(0, 4).map((seat) => (
            <Seat
              key={seat.id}
              seatId={seat.id}
              occupant={seat.profiles}
              isOwnSeat={seat.id === ownSeatId}
              onClick={() => handleSeatClick(seat)}
            />
          ))}
        </div>

        {/* Table */}
        <div className="flex justify-center mb-4">
          <div
            className="rounded-2xl flex items-center justify-center gap-4 px-8 py-3 shadow-md"
            style={{ background: '#c4a46b', border: '2px solid #a8883a', width: 340, height: 64 }}
          >
            <span className="text-lg">📚</span>
            <span className="text-base">🕯️</span>
            <span className="text-lg">📖</span>
            <span className="text-base">🍵</span>
            <span className="text-lg">📚</span>
          </div>
        </div>

        {/* Bottom row of seats */}
        <div className="flex gap-4 mt-4 justify-center">
          {seats.slice(4, 8).map((seat) => (
            <Seat
              key={seat.id}
              seatId={seat.id}
              occupant={seat.profiles}
              isOwnSeat={seat.id === ownSeatId}
              onClick={() => handleSeatClick(seat)}
            />
          ))}
        </div>

        {/* Room floor decorations */}
        <div className="flex justify-between mt-4 px-2 opacity-40 text-lg">
          <span>🌿</span><span>⭐</span><span>🍄</span><span>⭐</span><span>🌿</span>
        </div>

        {/* Coffee Break area */}
        <CoffeeBreakArea
          users={ownInCoffeeBreak
            ? coffeeBreakUsers.some((u) => u.id === currentUser.id)
              ? coffeeBreakUsers
              : [...coffeeBreakUsers, { id: currentUser.id, display_name: ownProfile.display_name, avatar_color: ownProfile.avatar_color }]
            : coffeeBreakUsers
          }
          onBreakClick={goToCoffeeBreak}
          onUserClick={(user) => {
            if (user.id !== currentUser.id) setMessageTarget(user)
          }}
        />
      </div>

      {/* Message popup */}
      {messageTarget && (
        <MessagePopup
          recipientName={messageTarget.display_name}
          onSend={sendMessage}
          onClose={() => setMessageTarget(null)}
        />
      )}

      {/* Notification stack */}
      <div className="fixed bottom-4 right-4 flex flex-col-reverse gap-2 z-50">
        {notifications.map((n) => (
          <MessageNotification
            key={n.id}
            id={n.id}
            senderName={n.senderName}
            text={n.text}
            onDismiss={dismissNotification}
          />
        ))}
      </div>

      {/* Profile modal */}
      {profileOpen && (
        <ProfileModal
          profile={ownProfile}
          tasksDoneCount={tasksDoneCount}
          onClose={() => setProfileOpen(false)}
          onSave={handleProfileSave}
        />
      )}
    </div>
  )
}
