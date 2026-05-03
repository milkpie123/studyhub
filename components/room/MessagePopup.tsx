'use client'

import { useEffect } from 'react'

const PRESET_MESSAGES = [
  'Hi there! 👋',
  'You got this! 💪',
  'How are you doing? 😊',
  'Keep up the great work! ⭐',
  'Taking a short break? 🍵',
]

interface MessagePopupProps {
  recipientName: string
  onSend: (text: string) => void
  onClose: () => void
}

export default function MessagePopup({ recipientName, onSend, onClose }: MessagePopupProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-5 w-72 border border-[#e8dfc8] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#b8a48a] hover:text-[#7a6650] text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
        <p className="text-sm font-bold text-[#4a3728] mb-3 pr-4">
          Send a message to {recipientName}
        </p>
        <div className="flex flex-col gap-2">
          {PRESET_MESSAGES.map((msg) => (
            <button
              key={msg}
              type="button"
              onClick={() => { onSend(msg); onClose() }}
              className="text-left text-sm px-3 py-2 rounded-xl transition-colors hover:bg-[#f0f7f0] text-[#4a3728] border border-[#e8dfc8]"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
