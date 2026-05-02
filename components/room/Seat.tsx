import Avatar from './Avatar'

export interface Profile {
  id: string
  display_name: string
  username: string
  avatar_color: string  // stores animal species name
}

interface SeatProps {
  seatId: number
  occupant: Profile | null
  isFocused: boolean
  isOwnSeat: boolean
}

export default function Seat({ seatId, occupant, isFocused, isOwnSeat }: SeatProps) {
  return (
    <div
      className={`
        w-16 h-20 rounded-2xl flex flex-col items-center justify-center gap-1
        border-2 transition-all duration-150 cursor-default
        ${isFocused
          ? 'border-[#7BAE7F] shadow-lg shadow-[#7BAE7F]/30 scale-105 bg-[#f0f7f0]'
          : isOwnSeat
          ? 'border-[#7BAE7F]/60 bg-[#f5fbf5]'
          : occupant
          ? 'border-[#d4c9b0] bg-[#fdf8ee]'
          : 'border-[#e8dfc8] bg-[#faf5e9]/60 border-dashed'
        }
      `}
      aria-label={`Seat ${seatId}${occupant ? ` — ${occupant.display_name}` : ' — empty'}`}
    >
      {occupant ? (
        <>
          <Avatar species={occupant.avatar_color} displayName={occupant.display_name} size={38} />
          <span className="text-[9px] text-[#7a6650] font-semibold truncate w-14 text-center leading-none">
            {occupant.display_name}
          </span>
        </>
      ) : (
        <span className="text-[18px] opacity-20">🪑</span>
      )}
    </div>
  )
}
