/* eslint-env jest */
import { isAsync } from '~/utils/isAsync'
import { wait } from '~/utils/wait'

describe('isAsync', () => {
  it('should return true when the given function is async', () => {
    const arrowAsync = isAsync(async () => {
      await wait(1000)
    })
    expect(arrowAsync).toBe(true)
    const promise = isAsync(wait)
    expect(promise).toBe(true)
    const otherPromise = isAsync(() => new Promise(resolve => resolve()))
    expect(otherPromise).toBe(true)
  })
  it('should return false when the given function is not async', () => {
    const arrowFn = isAsync(() => true)
    expect(arrowFn).toBe(false)
  })
})
