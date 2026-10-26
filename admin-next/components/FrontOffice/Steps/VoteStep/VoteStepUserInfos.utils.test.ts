import { getTitleValue } from './VoteStepUserInfos.utils'

describe('getTitleValue', () => {
  it.each([
    { voteProgress: 0, isValidated: false, expected: 2 },
    { voteProgress: 2, isValidated: true, expected: undefined },
  ])('returns $expected after $voteProgress votes for a min 2 max 4 poll', ({ voteProgress, isValidated, expected }) => {
    expect(getTitleValue('minMax', isValidated, 2, 4, voteProgress)).toBe(expected)
  })
})
