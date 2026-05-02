'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ANIMALS } from '@/components/room/Avatar'

const ANIMAL_LIST = Object.entries(ANIMALS).map(([key, val]) => ({ key, ...val }))

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [species, setSpecies] = useState(ANIMAL_LIST[0])
  const [passwordError, setPasswordError] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function validatePassword(value: string) {
    if (value.length > 0 && value.length < 8) {
      setPasswordError('Password must be at least 8 characters')
    } else {
      setPasswordError('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setServerError('')

    const supabase = createClient()

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .maybeSingle()

    if (existing) {
      setServerError('Username already taken')
      setLoading(false)
      return
    }

    const email = `${username.trim()}@studyhub.local`
    const { data, error } = await supabase.auth.signUp({ email, password })

    // If auth user already exists (orphan from a previous failed signup),
    // sign them in and try to create the missing profile
    if (error?.message?.toLowerCase().includes('already registered')) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError || !signInData.user) {
        setServerError('An account with this username exists but your password is wrong. Try a different username.')
        setLoading(false)
        return
      }
      // Check if profile already exists (shouldn't, but just in case)
      const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', signInData.user.id).maybeSingle()
      if (existingProfile) {
        router.push('/')
        return
      }
      // Create the missing profile
      await supabase.from('profiles').insert({
        id: signInData.user.id,
        display_name: displayName.trim(),
        username: username.trim(),
        avatar_color: species.key,
      })
      router.push('/')
      return
    }

    if (error || !data.user) {
      setServerError(error?.message ?? 'Signup failed')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      display_name: displayName.trim(),
      username: username.trim(),
      avatar_color: species.key,
    })

    if (profileError) {
      setServerError(`Failed to create profile: ${profileError.message}`)
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#faf3e4' }}>
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-sm border border-[#e8dfc8]">
        <h1 className="text-2xl font-extrabold text-center mb-1 text-[#4a3728]">Studyhub 🧙</h1>
        <p className="text-center text-xs text-[#9e8870] mb-5">choose your apprentice</p>

        {/* Animal avatar preview */}
        <div className="flex justify-center mb-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-md"
            style={{ background: `${species.robe}22`, border: `3px solid ${species.robe}66` }}
          >
            {species.emoji}
          </div>
        </div>
        <p className="text-center text-xs font-bold text-[#7a6650] mb-4">{species.label}</p>

        {/* Animal picker grid */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {ANIMAL_LIST.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => setSpecies(a)}
              className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-xl transition-all ${
                species.key === a.key
                  ? 'ring-2 ring-offset-1 scale-110 shadow-md'
                  : 'opacity-60 hover:opacity-90'
              }`}
              style={species.key === a.key ? { background: `${a.robe}18`, outline: `2px solid ${a.robe}` } : {}}
              aria-label={a.label}
            >
              {a.emoji}
              <span className="text-[9px] text-[#9e8870] font-semibold capitalize">{a.key}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="display name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-[#ddd0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BAE7F] bg-[#fdfaf5]"
          />
          <input
            type="text"
            placeholder="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-[#ddd0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BAE7F] bg-[#fdfaf5]"
          />
          <div>
            <input
              type="password"
              placeholder="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); validatePassword(e.target.value) }}
              className="w-full border border-[#ddd0bc] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7BAE7F] bg-[#fdfaf5]"
            />
            {passwordError && <p className="text-red-400 text-xs mt-1 ml-1">{passwordError}</p>}
          </div>

          {serverError && <p className="text-red-400 text-sm text-center">{serverError}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-2.5 rounded-xl text-white transition-colors disabled:opacity-60"
            style={{ background: '#7BAE7F' }}
          >
            {loading ? 'joining…' : 'join the library ✨'}
          </button>
        </form>

        <p className="text-center text-sm text-[#9e8870] mt-4">
          already an apprentice?{' '}
          <Link href="/login" className="font-bold" style={{ color: '#7BAE7F' }}>log in</Link>
        </p>
      </div>
    </div>
  )
}
