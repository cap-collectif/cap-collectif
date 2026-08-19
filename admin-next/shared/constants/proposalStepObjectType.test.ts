import { isProposalLikeObjectType } from './proposalStepObjectType'

describe('isProposalLikeObjectType', () => {
  it.each(['PROPOSAL', 'PROJECT', 'MISSION', 'IDEA', 'REPORTING', 'TESTIMONY', 'PICTURE'])(
    'maps %s to proposal behavior',
    objectType => {
      expect(isProposalLikeObjectType(objectType)).toBe(true)
    },
  )

  it.each(['OPINION', 'QUESTION', null, undefined])('does not map %s to proposal behavior', objectType => {
    expect(isProposalLikeObjectType(objectType)).toBe(false)
  })
})
