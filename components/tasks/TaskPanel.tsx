'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Task {
  id: string
  text: string
  checked: boolean
  created_at: string
}

interface TaskPanelProps {
  userId: string
}

export default function TaskPanel({ userId }: TaskPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newText, setNewText] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Only show tasks created today (local timezone) — natural daily reset
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    supabase
      .from('tasks')
      .select('id, text, checked, created_at')
      .eq('user_id', userId)
      .gte('created_at', startOfDay)
      .lt('created_at', endOfDay)
      .order('created_at')
      .then(({ data }) => {
        setTasks(data ?? [])
        setLoading(false)
      })
  }, [supabase, userId])

  async function addTask() {
    const text = newText.trim()
    if (!text) return

    const optimistic: Task = {
      id: crypto.randomUUID(),
      text,
      checked: false,
      created_at: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, optimistic])
    setNewText('')

    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: userId, text, checked: false })
      .select('id, text, checked, created_at')
      .single()

    if (!error && data) {
      setTasks((prev) => prev.map((t) => (t.id === optimistic.id ? data : t)))
    }
  }

  async function toggleTask(task: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, checked: !t.checked } : t))
    )
    await supabase.from('tasks').update({ checked: !task.checked }).eq('id', task.id)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') addTask()
  }

  const doneCount = tasks.filter((t) => t.checked).length

  return (
    <div
      className="rounded-3xl p-5 h-fit"
      style={{ background: '#fdfaf5', border: '2px solid #e8dfc8', boxShadow: '0 4px 20px #c4a46b22' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-extrabold text-[#4a3728] text-sm flex items-center gap-1">
          📋 daily tasks
        </h2>
        {tasks.length > 0 && (
          <span className="text-xs font-bold text-[#7BAE7F]">
            {doneCount}/{tasks.length}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-[#c4b49a] py-4 text-center">loading…</p>
      ) : tasks.length === 0 ? (
        <div className="py-4 text-center">
          <div className="text-2xl mb-1">🌱</div>
          <p className="text-xs text-[#b8a48a]">plant your first task below</p>
        </div>
      ) : (
        <ul className="space-y-2 mb-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={task.checked}
                onChange={() => toggleTask(task)}
                className="mt-0.5 cursor-pointer accent-[#7BAE7F]"
              />
              <span
                className={`text-sm flex-1 leading-snug ${
                  task.checked ? 'line-through text-[#c4b49a]' : 'text-[#4a3728]'
                }`}
              >
                {task.text}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: '#ede5d5' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(doneCount / tasks.length) * 100}%`, background: '#7BAE7F' }}
          />
        </div>
      )}

      {/* All done message */}
      {tasks.length > 0 && doneCount === tasks.length && (
        <p className="text-center text-xs font-bold text-[#7BAE7F] mb-2">✨ great work today!</p>
      )}

      {/* Add task */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="add a task…"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7BAE7F]"
          style={{ border: '1.5px solid #ddd0bc', background: '#fdfaf5' }}
        />
        <button
          onClick={addTask}
          className="text-white font-bold px-3 py-1.5 rounded-xl transition-colors"
          style={{ background: '#7BAE7F' }}
        >
          +
        </button>
      </div>
    </div>
  )
}
