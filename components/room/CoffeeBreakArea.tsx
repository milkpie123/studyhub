import Avatar from './Avatar'

interface CoffeeBreakUser {
  id: string
  display_name: string
  avatar_color: string
}

interface CoffeeBreakAreaProps {
  users: CoffeeBreakUser[]
  onBreakClick: () => void
  onUserClick: (user: CoffeeBreakUser) => void
}

export default function CoffeeBreakArea({ users, onBreakClick, onUserClick }: CoffeeBreakAreaProps) {
  return (
    <div
      onClick={onBreakClick}
      className="mt-4 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md"
      style={{ border: '2px solid #e8dfc8', background: '#fdf6e3' }}
    >
      <div className="text-center mb-3">
        <span className="text-xs font-bold tracking-widest uppercase text-[#9e8870]/80">☕ Coffee Break ☕</span>
      </div>

      {users.length === 0 ? (
        <p className="text-center text-xs text-[#b8a48a] py-2">quiet here… grab a cup ☕</p>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); onUserClick(user) }}
              className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
            >
              <Avatar species={user.avatar_color} displayName={user.display_name} size={36} />
              <span className="text-[9px] text-[#7a6650] font-semibold">{user.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
