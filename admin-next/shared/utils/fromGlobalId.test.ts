import { ensureGlobalId } from './fromGlobalId'

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
 */
describe('ensureGlobalId', () => {
  it('encodes a raw id and preserves an existing global id', () => {
    expect(ensureGlobalId('AbstractVote', '1053')).toBe('QWJzdHJhY3RWb3RlOjEwNTM=')
    expect(ensureGlobalId('AbstractVote', 'UmVwbHk6cmVwbHkx')).toBe('UmVwbHk6cmVwbHkx')
  })
})
