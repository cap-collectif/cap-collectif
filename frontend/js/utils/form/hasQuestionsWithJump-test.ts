import { simple, onlyJump } from './mocks'
import hasQuestionsWithJump from '~/utils/form/hasQuestionsWithJump'

describe('hasQuestionsWithJump', () => {
  it('should be false when no jump in question', () => {
    const hasQuestionsWithJumpResponse = hasQuestionsWithJump(simple)
    expect(hasQuestionsWithJumpResponse).toEqual(false)
  })
  it('should be true when there is jump in question', () => {
    const hasQuestionsWithJumpResponse = hasQuestionsWithJump(onlyJump)
    expect(hasQuestionsWithJumpResponse).toEqual(true)
  })
})
