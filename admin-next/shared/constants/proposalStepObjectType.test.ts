import { isProposalLikeObjectType } from './proposalStepObjectType'

/**
 * @jest-status reference
 * @jest-reason Checks the public proposal-type rule with explicit positive and negative parameterized cases.
 */
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
