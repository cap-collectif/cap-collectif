import { getVoteAction } from './getVoteAction'

describe('getVoteAction', () => {
  it.each(['VOTE', 'SUPPORT', 'SIGN'] as const)('returns %s as is', actionButtonLabel => {
    expect(getVoteAction(actionButtonLabel)).toBe(actionButtonLabel)
  })

  it.each([null, undefined, '%future added value'])('falls back to VOTE for %s', actionButtonLabel => {
    expect(getVoteAction(actionButtonLabel)).toBe('VOTE')
  })
})
