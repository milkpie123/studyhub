'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .maybeSingle()

    if (!profile) {
      setError('Invalid username or password')
      setLoading(false)
      return
    }

    const email = `${username.trim()}@studyhub.local`
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('Invalid username or password')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#faf3e4' }}>
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-sm border border-[#e8dfc8]">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏡</div>
          <h1 className="text-2xl font-extrabold text-[#4a3728]">Studyhub</h1>
          <p className="text-xs text-[#9e8870] mt-1">welcome back, apprentice</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-[#ddd0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BAE7F] bg-[#fdfaf5]"
          />
          <input
            type="password"
            placeholder="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#ddd0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BAE7F] bg-[#fdfaf5]"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-2.5 rounded-xl text-white transition-colors disabled:opacity-60"
            style={{ background: '#7BAE7F' }}
          >
            {loading ? 'opening the door…' : 'enter the library 🚪'}
          </button>
        </form>

        <p className="text-center text-sm text-[#9e8870] mt-4">
          not an apprentice yet?{' '}
          <Link href="/signup" className="font-bold" style={{ color: '#7BAE7F' }}>sign up</Link>
        </p>
      </div>
    </div>
  )
}
