import {
  getContributionObjectTypeTranslationKey,
  isFeminineContributionObjectType,
  isProposalLikeObjectType,
} from './proposalStepObjectType'

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

describe('getContributionObjectTypeTranslationKey', () => {
  it.each([
    ['PROPOSAL', 'proposal'],
    ['PROJECT', 'project'],
    ['MISSION', 'mission'],
    ['OPINION', 'opinion'],
    ['IDEA', 'idea'],
    ['QUESTION', 'question'],
    ['REPORTING', 'reporting'],
    ['TESTIMONY', 'testimony'],
    ['PICTURE', 'picture'],
  ])('maps %s to %s', (objectType, expected) => {
    expect(getContributionObjectTypeTranslationKey(objectType)).toBe(expected)
  })

  it.each([null, undefined, 'UNKNOWN'])('falls back to proposal for %s', objectType => {
    expect(getContributionObjectTypeTranslationKey(objectType)).toBe('proposal')
  })
})

describe('isFeminineContributionObjectType', () => {
  it.each(['PROPOSAL', 'MISSION', 'IDEA', 'QUESTION', 'PICTURE'])('recognizes %s as feminine', objectType => {
    expect(isFeminineContributionObjectType(objectType)).toBe(true)
  })

  it.each(['PROJECT', 'OPINION', 'REPORTING', 'TESTIMONY', null, undefined])(
    'does not recognize %s as feminine',
    objectType => {
      expect(isFeminineContributionObjectType(objectType)).toBe(false)
    },
  )
})
