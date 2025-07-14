import { describe, test, expect } from 'vitest'

describe('Utility Functions', () => {
  test('should format currency correctly', () => {
    const formatCurrency = (amount) => `${amount} ج.م`
    expect(formatCurrency(100)).toBe('100 ج.م')
  })

  test('should validate email format', () => {
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('invalid-email')).toBe(false)
  })

  test('should handle RTL text direction', () => {
    const isRTL = (text) => /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/.test(text)
    expect(isRTL('إنشاء مجموعة')).toBe(true)
    expect(isRTL('Create Group')).toBe(false)
  })
})
