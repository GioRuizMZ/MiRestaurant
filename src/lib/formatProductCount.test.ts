import { describe, expect, it } from 'vitest'
import { formatProductCount } from './formatProductCount'

describe('formatProductCount', () => {
  it('usa singular solo para 1', () => {
    expect(formatProductCount(0)).toBe('0 productos')
    expect(formatProductCount(1)).toBe('1 producto')
    expect(formatProductCount(3)).toBe('3 productos')
  })
})
