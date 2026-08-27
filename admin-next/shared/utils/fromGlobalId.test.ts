import { ensureGlobalId } from './fromGlobalId'

describe('ensureGlobalId', () => {
  it('encodes a raw id and preserves an existing global id', () => {
    expect(ensureGlobalId('AbstractVote', '1053')).toBe('QWJzdHJhY3RWb3RlOjEwNTM=')
    expect(ensureGlobalId('AbstractVote', 'UmVwbHk6cmVwbHkx')).toBe('UmVwbHk6cmVwbHkx')
  })
})
