import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Inertia.js
global.route = vi.fn()
global.usePage = vi.fn(() => ({
  props: {}
}))

// Mock SweetAlert2
global.Swal = {
  fire: vi.fn(),
  mixin: vi.fn(() => ({
    fire: vi.fn()
  }))
}
