import { getThresholdProgress } from './voteThreshold.utils'

describe('getThresholdProgress', () => {
  it.each([
    { votesCount: 0, expected: 0 },
    { votesCount: 1, expected: 0 },
    { votesCount: 15470, expected: 10 },
    { votesCount: 149999, expected: 99 },
    { votesCount: 150000, expected: 100 },
    { votesCount: 198230, expected: 100 },
  ])('fills $expected% of the gauge for $votesCount votes out of 150000', ({ votesCount, expected }) => {
    expect(getThresholdProgress(votesCount, 150000)).toBe(expected)
  })

  it('leaves the gauge empty when the step has no threshold', () => {
    expect(getThresholdProgress(12, 0)).toBe(0)
  })
})
