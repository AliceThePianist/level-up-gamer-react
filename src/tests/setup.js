import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup, configure } from '@testing-library/react'
import { simularApi } from './apiSimulada'

configure({ asyncUtilTimeout: 5000 })

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  simularApi()
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:imagen-de-prueba')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
