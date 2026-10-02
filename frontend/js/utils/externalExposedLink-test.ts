/* eslint-env jest */
import { getExternalExposedLink } from './externalExposedLink'

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
 */
describe('validateResponses', () => {
  it('Should return github.com', () => {
    const value = getExternalExposedLink('https://github.com/cap-collectif/platform/issues/8639')
    expect(value).toEqual('github.com')
  })
  it('Should return github.com despite the fact that there is no backslash at the end', () => {
    const value = getExternalExposedLink('https://github.com')
    expect(value).toEqual('github.com')
  })
  it('Should return github.com despite the fact that there is no host given', () => {
    const value = getExternalExposedLink('github.com/cap-collectif/platform/issues/8639')
    expect(value).toEqual('github.com')
  })
})
