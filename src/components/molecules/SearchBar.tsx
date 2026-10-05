import { Icon } from '@/components/atoms/Icon'
import { IconButton } from '@/components/atoms/IconButton'
import { Input } from '@/components/atoms/Input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
}

export function SearchBar({ value, onChange, onClear, placeholder = 'Buscar productos...' }: SearchBarProps) {
  return (
    <div role="search" className="relative w-full">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
        <Icon name="search" className="size-4" />
      </span>
      <Input
        type="text"
        aria-label="Buscar productos"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pr-10 pl-9"
      />
      {value !== '' && (
        <IconButton
          icon="close"
          label="Borrar búsqueda"
          onClick={onClear}
          className="absolute inset-y-0 right-0 size-10 hover:bg-transparent"
        />
      )}
    </div>
  )
}
