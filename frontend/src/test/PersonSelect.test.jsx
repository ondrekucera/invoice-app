import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PersonSelect from '../components/PersonSelect'

const mockPersons = [
  { _id: 1, name: 'Jan Novák', identificationNumber: '12345678' },
  { _id: 2, name: 'Petr Svoboda', identificationNumber: '87654321' },
]

describe('PersonSelect', () => {
  it('zobrazí placeholder pokud není vybrána osoba', () => {
    render(
      <PersonSelect
        label="Dodavatel *"
        persons={mockPersons}
        value=""
        onChange={vi.fn()}
        placeholder="— Vyberte dodavatele —"
        onPersonCreated={vi.fn()}
      />
    )
    expect(screen.getByText('— Vyberte dodavatele —')).toBeInTheDocument()
  })

  it('zobrazí jméno vybrané osoby', () => {
    render(
      <PersonSelect
        label="Dodavatel *"
        persons={mockPersons}
        value={1}
        onChange={vi.fn()}
        placeholder="— Vyberte —"
        onPersonCreated={vi.fn()}
      />
    )
    expect(screen.getByText('Jan Novák')).toBeInTheDocument()
  })

  it('otevře dropdown po kliknutí na trigger', () => {
    render(
      <PersonSelect
        label="Dodavatel *"
        persons={mockPersons}
        value=""
        onChange={vi.fn()}
        placeholder="— Vyberte —"
        onPersonCreated={vi.fn()}
      />
    )
    const trigger = screen.getByRole('button', { name: /Vyberte/i })
    fireEvent.click(trigger)
    expect(screen.getByPlaceholderText('Hledat osobu...')).toBeInTheDocument()
  })

  it('zobrazí volbu Vytvořit novou osobu v dropdownu', () => {
    render(
      <PersonSelect
        label="Dodavatel *"
        persons={mockPersons}
        value=""
        onChange={vi.fn()}
        placeholder="— Vyberte —"
        onPersonCreated={vi.fn()}
      />
    )
    const trigger = screen.getByRole('button', { name: /Vyberte/i })
    fireEvent.click(trigger)
    expect(screen.getByText('Vytvořit novou osobu')).toBeInTheDocument()
  })

  it('zavolá onChange po výběru osoby', () => {
    const onChange = vi.fn()
    render(
      <PersonSelect
        label="Dodavatel *"
        persons={mockPersons}
        value=""
        onChange={onChange}
        placeholder="— Vyberte —"
        onPersonCreated={vi.fn()}
      />
    )
    const trigger = screen.getByRole('button', { name: /Vyberte/i })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByText('Jan Novák'))
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
