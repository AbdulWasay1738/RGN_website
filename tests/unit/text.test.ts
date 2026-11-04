import { describe, expect, it } from 'vitest'
import { fillNumber, interpolate, parseAccentText, plainText } from '@/lib/text'

describe('accent text', () => {
  it('splits accent and swoosh markers', () => {
    expect(parseAccentText('Choose a *starting point.*')).toEqual([
      { text: 'Choose a ', kind: 'plain' },
      { text: 'starting point.', kind: 'accent' },
    ])
    expect(parseAccentText('doing the _selling_ for you?')[1]).toEqual({ text: 'selling', kind: 'swoosh' })
    expect(plainText('Recent wins & *milestones*')).toBe('Recent wins & milestones')
  })
  it('interpolates tokens and the [number] placeholder', () => {
    expect(interpolate('Step {step} of 04', { step: '01' })).toBe('Step 01 of 04')
    expect(fillNumber('within [number] business days', 3)).toBe('within 3 business days')
    expect(fillNumber('within [number] business days', undefined)).toBe('within [number] business days')
  })
})
