import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import StudyRoom from '@/components/room/StudyRoom'
import TaskPanel from '@/components/tasks/TaskPanel'

export default async function RoomPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_color, in_coffee_break, created_at')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: rawSeats } = await supabase
    .from('seats')
    .select('id, occupied_by, occupied_at, profiles(id, display_name, username, avatar_color, in_coffee_break)')
    .order('id')

  const { data: initialCoffeeBreakUsers } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_color')
    .eq('in_coffee_break', true)

  // Supabase returns joined tables as arrays; normalize to single profile or null
  const seats = (rawSeats ?? []).map((s) => ({
    ...s,
    profiles: Array.isArray(s.profiles) ? (s.profiles[0] ?? null) : s.profiles,
  }))

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#faf3e4' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-3"
        style={{ background: '#fdfaf5', borderBottom: '2px solid #e8dfc8' }}
      >
        <span className="font-extrabold text-[#4a3728] text-lg">🧙 Studyhub</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#7a6650]">{profile.display_name}</span>
          <form action="/api/logout" method="post">
            <button
              type="submit"
              className="text-xs font-semibold text-[#b8a48a] hover:text-[#7a6650] transition-colors"
            >
              leave 🚪
            </button>
          </form>
        </div>
      </header>

      {/* Main layout */}
      <main className="flex flex-1 gap-6 p-6 items-start justify-center">
        {/* Room */}
        <div className="flex-1 flex justify-center">
          <StudyRoom
            currentUser={profile}
            initialSeats={seats as Parameters<typeof StudyRoom>[0]['initialSeats']}
            initialCoffeeBreakUsers={initialCoffeeBreakUsers ?? []}
          />
        </div>

        {/* Task panel */}
        <aside className="w-72 shrink-0">
          <TaskPanel userId={user.id} />
        </aside>
      </main>
    </div>
  )
}
