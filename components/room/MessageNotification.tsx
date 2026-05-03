'use client'

import { useEffect, useRef, useState } from 'react'

interface MessageNotificationProps {
  id: string
  senderName: string
  text: string
  onDismiss: (id: string) => void
}

export default function MessageNotification({ id, senderName, text, onDismiss }: MessageNotificationProps) {
  const [heartRed, setHeartRed] = useState(false)
  const dismissedRef = useRef(false)

  const dismiss = () => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setHeartRed(true)
    setTimeout(() => onDismiss(id), 400)
  }

  useEffect(() => {
    const timer = setTimeout(dismiss, 15000)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#e8dfc8] px-4 py-3 w-64 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#4a3728] mb-0.5">{senderName}</p>
        <p className="text-sm text-[#7a6650]">{text}</p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-lg leading-none mt-0.5"
        style={{
          transition: 'filter 200ms',
          filter: heartRed ? 'none' : undefined,
        }}
      >
        <span style={{ transition: 'all 200ms' }}>
          {heartRed ? '❤️' : '🤍'}
        </span>
      </button>
    </div>
  )
}
