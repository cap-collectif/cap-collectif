/* eslint-env jest */
import { formatConnectionPath } from './relay'

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
 */
describe('formatConnectionPath', () => {
  const path = ['client', 'anIdOfEntity']
  const key = 'FaceToFace_opinions'
  it('should format correctly connection path relay', () => {
    expect(formatConnectionPath(path, key)).toEqual(`client:anIdOfEntity:__FaceToFace_opinions_connection`)
  })
})
