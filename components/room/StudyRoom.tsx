'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Seat, { type Profile } from './Seat'

interface SeatRow {
  id: number
  occupied_by: string | null
  occupied_at: string | null
  profiles: Profile | null
}

interface StudyRoomProps {
  currentUser: Profile
  initialSeats: SeatRow[]
}

// 8 seats arranged in a 4×2 grid (top row: 1-4, bottom row: 5-8)
// Navigation adjacency map: seat index → { up, down, left, right } seat index (null = no neighbor)
const ADJACENCY: Record<number, { up: number | null; down: number | null; left: number | null; right: number | null }> = {
  0: { up: null, down: 4, left: null, right: 1 },
  1: { up: null, down: 5, left: 0, right: 2 },
  2: { up: null, down: 6, left: 1, right: 3 },
  3: { up: null, down: 7, left: 2, right: null },
  4: { up: 0, down: null, left: null, right: 5 },
  5: { up: 1, down: null, left: 4, right: 6 },
  6: { up: 2, down: null, left: 5, right: 7 },
  7: { up: 3, down: null, left: 6, right: null },
}

const ARROW_TO_DIR: Record<string, keyof typeof ADJACENCY[0]> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

export default function StudyRoom({ currentUser, initialSeats }: StudyRoomProps) {
  const [seats, setSeats] = useState<SeatRow[]>(initialSeats)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const supabase = createClient()
  const containerRef = useRef<HTMLDivElement>(null)

  // Real-time subscription: merge seat-change events into local state
  useEffect(() => {
    const channel = supabase
      .channel('seats-presence')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'seats' },
        async (payload) => {
          const updatedSeat = payload.new as { id: number; occupied_by: string | null; occupied_at: string | null }

          // Fetch profile for the occupant if any
          let profile: Profile | null = null
          if (updatedSeat.occupied_by) {
            const { data } = await supabase
              .from('profiles')
              .select('id, display_name, username, avatar_color')
              .eq('id', updatedSeat.occupied_by)
              .single()
            profile = data
          }

          setSeats((prev) =>
            prev.map((s) =>
              s.id === updatedSeat.id
                ? { ...s, occupied_by: updatedSeat.occupied_by, occupied_at: updatedSeat.occupied_at, profiles: profile }
                : s
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      const dir = ARROW_TO_DIR[e.key]
      if (dir) {
        e.preventDefault()
        const next = ADJACENCY[focusedIndex][dir]
        if (next !== null) setFocusedIndex(next)
        return
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const seat = seats[focusedIndex]
        if (!seat) return

        if (seat.occupied_by === currentUser.id) {
          // Unclaim own seat
          await supabase
            .from('seats')
            .update({ occupied_by: null, occupied_at: null })
            .eq('id', seat.id)
        } else if (!seat.occupied_by) {
          // Clear any previous claim, then claim this seat
          await supabase
            .from('seats')
            .update({ occupied_by: null, occupied_at: null })
            .eq('occupied_by', currentUser.id)

          await supabase
            .from('seats')
            .update({ occupied_by: currentUser.id, occupied_at: new Date().toISOString() })
            .eq('id', seat.id)
        }
        // If occupied by another user — do nothing (satisfies cannot claim requirement)
      }
    },
    [focusedIndex, seats, currentUser.id, supabase]
  )

  useEffect(() => {
    const el = containerRef.current
    el?.focus()
    el?.addEventListener('keydown', handleKeyDown)
    return () => el?.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const ownSeatId = seats.find((s) => s.occupied_by === currentUser.id)?.id ?? null

  return (
    <div ref={containerRef} tabIndex={0} className="outline-none">
      {/* Room — warm golden-green library, top-down view */}
      <div
        className="relative rounded-3xl p-6 w-fit mx-auto shadow-xl"
        style={{ background: 'linear-gradient(160deg, #d8e8c2 0%, #c9d9a8 100%)', border: '3px solid #b5c98a' }}
      >
        {/* Room label */}
        <div className="text-center mb-4">
          <span className="text-xs font-bold tracking-widest uppercase text-[#7a9a50]/80">✨ Study Hall ✨</span>
        </div>

        {/* Top row of seats */}
        <div className="flex gap-4 mb-4 justify-center">
          {seats.slice(0, 4).map((seat, i) => (
            <Seat key={seat.id} seatId={seat.id} occupant={seat.profiles}
              isFocused={focusedIndex === i} isOwnSeat={seat.id === ownSeatId} />
          ))}
        </div>

        {/* Table */}
        <div className="flex justify-center mb-4">
          <div
            className="rounded-2xl flex items-center justify-center gap-4 px-8 py-3 shadow-md"
            style={{ background: '#c4a46b', border: '2px solid #a8883a', width: 340, height: 64 }}
          >
            {/* Books & candle decorations */}
            <span className="text-lg">📚</span>
            <span className="text-base">🕯️</span>
            <span className="text-lg">📖</span>
            <span className="text-base">🍵</span>
            <span className="text-lg">📚</span>
          </div>
        </div>

        {/* Bottom row of seats */}
        <div className="flex gap-4 mt-4 justify-center">
          {seats.slice(4, 8).map((seat, i) => (
            <Seat key={seat.id} seatId={seat.id} occupant={seat.profiles}
              isFocused={focusedIndex === i + 4} isOwnSeat={seat.id === ownSeatId} />
          ))}
        </div>

        {/* Room floor decorations */}
        <div className="flex justify-between mt-4 px-2 opacity-40 text-lg">
          <span>🌿</span><span>⭐</span><span>🍄</span><span>⭐</span><span>🌿</span>
        </div>
      </div>

      <p className="text-center text-xs text-[#7a9a50]/70 mt-3 font-semibold tracking-wide">
        ↑ ↓ ← → to move &nbsp;·&nbsp; enter/space to sit
      </p>
    </div>
  )
}
