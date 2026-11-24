import { isVotePeriodOver } from './isVotePeriodOver'

describe('isVotePeriodOver', () => {
  const now = new Date('2026-11-16T12:00:00')

  it('closes the vote of an archived proposal even without archiving deadline', () => {
    expect(isVotePeriodOver({ isArchived: true, archiveLimitDate: null, proposalArchivedTime: 0 }, now)).toBe(true)
  })

  it('closes the vote once the archiving deadline has passed, even though the proposal is not archived', () => {
    expect(
      isVotePeriodOver({ isArchived: false, archiveLimitDate: '2026-11-16 00:00:00', proposalArchivedTime: 6 }, now),
    ).toBe(true)
  })

  it('keeps the vote open while the archiving deadline is running', () => {
    expect(
      isVotePeriodOver({ isArchived: false, archiveLimitDate: '2026-11-17 00:00:00', proposalArchivedTime: 6 }, now),
    ).toBe(false)
  })

  it('ignores the deadline of another step when the current step does not archive proposals', () => {
    expect(
      isVotePeriodOver({ isArchived: false, archiveLimitDate: '2020-01-01 00:00:00', proposalArchivedTime: 0 }, now),
    ).toBe(false)
  })
})
