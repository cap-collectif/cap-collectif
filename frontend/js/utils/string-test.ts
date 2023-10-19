/* eslint-env jest */
import { cleanDomId } from './string'

describe('cleanDomId', () => {
  it('should return a correct DOM ID', () => {
    const value = cleanDomId('CreateReplyForm-responses[0]')
    expect(value).toEqual('CreateReplyForm-responses0')
  })
  it('should return a correct DOM ID when using special chars', () => {
    const value = cleanDomId('ÉmaraboutDeFicellô[0]')
    expect(value).toEqual('EmaraboutDeFicello0')
  })
})
