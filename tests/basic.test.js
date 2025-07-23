import { describe, test, expect } from 'vitest'

describe('Basic Test Suite', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true)
  })

  test('should handle arithmetic correctly', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
    expect(3 * 4).toBe(12)
  })

  test('should handle string operations', () => {
    expect('hello world').toContain('hello')
    expect('test'.toUpperCase()).toBe('TEST')
  })

  test('should handle arrays', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
  })

  test('should handle objects', () => {
    const user = { name: 'John', age: 30 }
    expect(user).toHaveProperty('name')
    expect(user.name).toBe('John')
  })
})
