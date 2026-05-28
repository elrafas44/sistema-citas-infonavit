import { render, screen } from '@testing-library/react'
import MisCitas from '../pages/mis-citas'


jest.mock('jspdf', () => jest.fn())
jest.mock('qrcode', () => ({
  toDataURL: jest.fn()
}))


jest.mock('next/router', () => ({
  useRouter() {
    return { 
      route: '/', 
      pathname: '', 
      query: '', 
      asPath: '',
      push: jest.fn()
    }
  },
}))

describe('Pruebas del Sistema de Citas (Materia: Pruebas de Software)', () => {
  
  
  test('Debería renderizar correctamente el título principal de la interfaz', () => {
    render(<MisCitas />)
    const titulo = screen.getByRole('heading', { name: /Mis Citas Agendadas/i })
    expect(titulo).toBeInTheDocument()
  })

  
  test('Debería arrancar la aplicación mostrando el estado de carga correcto', () => {
    render(<MisCitas />)
    const estadoCarga = screen.getByText(/Consultando base de datos.../i)
    expect(estadoCarga).toBeInTheDocument()
  })
})