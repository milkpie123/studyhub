'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ANIMALS } from '@/components/room/Avatar'
import ProfileModal from './ProfileModal'

interface ProfileCardProps {
  profile: {
    id: string
    display_name: string
    avatar_color: string
    created_at: string
  }
}

export default function ProfileCard({ profile: initialProfile }: ProfileCardProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [open, setOpen] = useState(false)
  const [tasksDoneCount, setTasksDoneCount] = useState(0)
  const supabase = createClient()

  const animal = ANIMALS[profile.avatar_color] ?? ANIMALS.fox

  async function openModal() {
    const { count } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('checked', true)
    setTasksDoneCount(count ?? 0)
    setOpen(true)
  }

  async function handleSave(updates: { display_name: string; avatar_color: string }) {
    await supabase.from('profiles').update(updates).eq('id', profile.id)
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  return (
    <>
      <button
        onClick={openModal}
        className="w-full rounded-3xl p-4 text-left transition-colors hover:bg-[#f5f0e8]"
        style={{ background: '#fdfaf5', border: '2px solid #e8dfc8', boxShadow: '0 4px 20px #c4a46b22' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 shadow-sm"
            style={{ background: `${animal.robe}22`, border: `2px solid ${animal.robe}55` }}
          >
            {animal.emoji}
          </div>
          <div>
            <p className="font-extrabold text-[#4a3728] text-sm">{profile.display_name}</p>
            <p className="text-xs text-[#9e8870]">{animal.label}</p>
          </div>
        </div>
      </button>

      {open && (
        <ProfileModal
          profile={profile}
          tasksDoneCount={tasksDoneCount}
          onClose={() => setOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  )
}
