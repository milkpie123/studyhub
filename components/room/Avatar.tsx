export const ANIMALS: Record<string, { emoji: string; label: string; robe: string }> = {
  fox:      { emoji: '🦊', label: 'Fox Apprentice',      robe: '#E8820C' },
  frog:     { emoji: '🐸', label: 'Frog Apprentice',     robe: '#5a9e6f' },
  bear:     { emoji: '🐻', label: 'Bear Apprentice',     robe: '#92400e' },
  owl:      { emoji: '🦉', label: 'Owl Apprentice',      robe: '#6d4fa0' },
  rabbit:   { emoji: '🐰', label: 'Rabbit Apprentice',   robe: '#d4748c' },
  badger:   { emoji: '🦡', label: 'Badger Apprentice',   robe: '#6b7280' },
  squirrel: { emoji: '🐿️', label: 'Squirrel Apprentice', robe: '#b45309' },
  raccoon:  { emoji: '🦝', label: 'Raccoon Apprentice',  robe: '#2a8c8c' },
}

interface AvatarProps {
  species: string
  displayName: string
  size?: number
}

export default function Avatar({ species, displayName, size = 40 }: AvatarProps) {
  const animal = ANIMALS[species] ?? ANIMALS.fox
  const fontSize = size * 0.55

  return (
    <div
      className="rounded-full flex items-center justify-center select-none shadow-sm"
      style={{
        width: size,
        height: size,
        fontSize,
        background: `${animal.robe}22`,
        border: `2px solid ${animal.robe}55`,
      }}
      title={`${displayName} (${animal.label})`}
    >
      {animal.emoji}
    </div>
  )
}
