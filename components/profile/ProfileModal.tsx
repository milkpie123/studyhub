'use client'

import { useState } from 'react'
import { ANIMALS } from '@/components/room/Avatar'

const ANIMAL_LIST = Object.entries(ANIMALS).map(([key, val]) => ({ key, ...val }))

interface ProfileModalProps {
  profile: {
    id: string
    display_name: string
    avatar_color: string
    created_at: string
  }
  tasksDoneCount: number
  onClose: () => void
  onSave: (updates: { display_name: string; avatar_color: string }) => void
}

export default function ProfileModal({ profile, tasksDoneCount, onClose, onSave }: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [species, setSpecies] = useState(profile.avatar_color)

  const daysOnSite = Math.max(1, Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000))

  const currentAnimal = ANIMALS[species] ?? ANIMALS.fox

  function handleSave() {
    if (displayName.trim() !== profile.display_name || species !== profile.avatar_color) {
      onSave({ display_name: displayName.trim(), avatar_color: species })
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(74,55,40,0.3)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm border border-[#e8dfc8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-[#4a3728]">My Profile</h2>
          <button
            onClick={onClose}
            className="text-[#b8a48a] hover:text-[#7a6650] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex justify-center mb-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md"
            style={{ background: `${currentAnimal.robe}22`, border: `3px solid ${currentAnimal.robe}66` }}
          >
            {currentAnimal.emoji}
          </div>
        </div>
        <p className="text-center text-xs font-bold text-[#7a6650] mb-4">{currentAnimal.label}</p>

        {/* Animal picker */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {ANIMAL_LIST.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setSpecies(a.key)}
              className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-xl transition-all ${
                species === a.key
                  ? 'ring-2 ring-offset-1 scale-110 shadow-md'
                  : 'opacity-60 hover:opacity-90'
              }`}
              style={species === a.key ? { background: `${a.robe}18`, outline: `2px solid ${a.robe}` } : {}}
              aria-label={a.label}
            >
              {a.emoji}
              <span className="text-[9px] text-[#9e8870] font-semibold capitalize">{a.key}</span>
            </button>
          ))}
        </div>

        {/* Display name */}
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="display name"
          className="w-full border border-[#ddd0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BAE7F] bg-[#fdfaf5] mb-4"
        />

        {/* Stats */}
        <div className="flex justify-around text-center mb-5 py-3 rounded-2xl bg-[#fdf6e3] border border-[#e8dfc8]">
          <div>
            <p className="text-xl font-extrabold text-[#4a3728]">{daysOnSite}</p>
            <p className="text-[10px] text-[#9e8870] font-semibold">days on site</p>
          </div>
          <div className="w-px bg-[#e8dfc8]" />
          <div>
            <p className="text-xl font-extrabold text-[#4a3728]">{tasksDoneCount}</p>
            <p className="text-[10px] text-[#9e8870] font-semibold">tasks done</p>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full font-bold py-2.5 rounded-xl text-white transition-colors"
          style={{ background: '#7BAE7F' }}
        >
          save changes ✨
        </button>
      </div>
    </div>
  )
}
