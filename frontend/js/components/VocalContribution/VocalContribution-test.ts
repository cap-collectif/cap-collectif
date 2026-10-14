/* eslint-env jest */
import { formatClock } from './utils'
import { getMicErrorKind } from './useVocalRecorder'
import { getAudioWaveHeights, getWaveHeights } from './VocalContributionPlayer'

describe('formatClock', () => {
  test.each([
    [0, '0:00'],
    [9.6, '0:09'],
    [60, '1:00'],
    [180, '3:00'],
    [-4, '0:00'],
  ])('formats %p seconds as %p', (seconds, expected) => {
    expect(formatClock(seconds)).toBe(expected)
  })
})

describe('getWaveHeights', () => {
  it('draws a flat waveform when no level was recorded', () => {
    expect(getWaveHeights([], 4)).toEqual([8, 8, 8, 8])
  })

  it('keeps the peak level of each slice, with a minimum height', () => {
    expect(getWaveHeights([0.1, 0.5, 0.02, 0.01, 1, 0.3], 3)).toEqual([50, 8, 100])
  })
})

describe('getAudioWaveHeights', () => {
  it('splits the whole audio into equal slices, relative to the loudest one', () => {
    const samples = new Float32Array([0.5, -0.5, 0.25, -0.25, 0, 0])
    expect(getAudioWaveHeights(samples, 3)).toEqual([100, 50, 8])
  })

  it('draws a flat waveform for a silent audio', () => {
    expect(getAudioWaveHeights(new Float32Array(4), 2)).toEqual([8, 8])
  })
})

describe('getMicErrorKind', () => {
  test.each([
    ['NotAllowedError', 'denied'],
    ['SecurityError', 'denied'],
    ['NotFoundError', 'absent'],
    ['NotReadableError', 'busy'],
    ['Unsupported', 'unsupported'],
    ['SomethingElse', 'other'],
  ])('maps %p to %p', (name, expected) => {
    expect(getMicErrorKind({ name })).toBe(expected)
  })

  it('treats a missing error as an unknown problem', () => {
    expect(getMicErrorKind(null)).toBe('other')
  })
})
