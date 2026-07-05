import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CompleteJobModal } from '@/components/instalador/CompleteJobModal'

// ============================================================
// SDD - CompleteJobModal
// El instalador NO puede entregar sin evidencia fotográfica.
// ============================================================

describe('CompleteJobModal', () => {
  const onSubmit = jest.fn().mockResolvedValue(undefined)
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('no renderiza nada si está cerrado', () => {
    const { container } = render(
      <CompleteJobModal isOpen={false} onClose={onClose} onSubmit={onSubmit} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('explica que la evidencia es obligatoria', () => {
    render(<CompleteJobModal isOpen onClose={onClose} onSubmit={onSubmit} />)
    expect(screen.getAllByText(/evidencia/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/obligatori/i)).toBeInTheDocument()
  })

  it('el botón de entregar está deshabilitado sin fotos', () => {
    render(<CompleteJobModal isOpen onClose={onClose} onSubmit={onSubmit} />)
    expect(screen.getByRole('button', { name: /entregar/i })).toBeDisabled()
  })

  it('con una foto seleccionada, habilita entregar y envía el FormData', async () => {
    render(<CompleteJobModal isOpen onClose={onClose} onSubmit={onSubmit} />)

    const file = new File(['foto'], 'terminado.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/agregar fotos/i) as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    const submitBtn = screen.getByRole('button', { name: /entregar/i })
    await waitFor(() => expect(submitBtn).toBeEnabled())

    fireEvent.click(submitBtn)
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

    const formData = onSubmit.mock.calls[0][0] as FormData
    expect(formData.getAll('files')).toHaveLength(1)
  })

  it('rechaza archivos que no son imágenes', async () => {
    render(<CompleteJobModal isOpen onClose={onClose} onSubmit={onSubmit} />)

    const pdf = new File(['doc'], 'remito.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(/agregar fotos/i) as HTMLInputElement
    fireEvent.change(input, { target: { files: [pdf] } })

    await waitFor(() =>
      expect(screen.getByText(/solo se aceptan fotos/i)).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: /entregar/i })).toBeDisabled()
  })
})
