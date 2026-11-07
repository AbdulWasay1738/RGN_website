import { describe, expect, it } from 'vitest'
import { bundlePriceTokens, fillNumber, interpolate, parseAccentText, plainText } from '@/lib/text'

describe('accent text', () => {
  it('splits accent and swoosh markers', () => {
    expect(parseAccentText('Choose a *starting point.*')).toEqual([
      { text: 'Choose a ', kind: 'plain' },
      { text: 'starting point.', kind: 'accent' },
    ])
    expect(parseAccentText('doing the _selling_ for you?')[1]).toEqual({ text: 'selling', kind: 'swoosh' })
    expect(plainText('Recent wins & *milestones*')).toBe('Recent wins & milestones')
  })
  it('reads the round-two hero headline: a line break, and a swoosh inside the accent', () => {
    expect(parseAccentText('Attract more best fit customers.\n*Win more _business._*')).toEqual([
      { text: 'Attract more best fit customers.', kind: 'plain' },
      { text: '', kind: 'break' },
      { text: 'Win more ', kind: 'accent' },
      { text: 'business.', kind: 'swoosh', accent: true },
    ])
    expect(plainText('Attract more best fit customers.\n*Win more _business._*')).toBe('Attract more best fit customers. Win more business.')
  })
  it('interpolates tokens and the [number] placeholder', () => {
    expect(interpolate('Step {step} of 04', { step: '01' })).toBe('Step 01 of 04')
    expect(fillNumber('within [number] business days', 3)).toBe('within 3 business days')
    expect(fillNumber('within [number] business days', undefined)).toBe('within [number] business days')
  })
  it('fills bundle price tokens', () => {
    const tokens = bundlePriceTokens({ price: 597, introPrice: 399, compareAt: 797, compareAtIntro: 447 })
    expect(interpolate('All three for {introPrice} through January 15, then {price}.', tokens)).toBe('All three for $399 through January 15, then $597.')
    expect(interpolate('Bought separately, the three courses total {compareAt}. The bundle saves {save}.', tokens)).toBe(
      'Bought separately, the three courses total $797. The bundle saves $200.',
    )
    expect(interpolate('{compareAtIntro}', tokens)).toBe('$447')
  })
})
