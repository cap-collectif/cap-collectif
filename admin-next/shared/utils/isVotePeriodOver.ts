import moment from 'moment'

type VotePeriod = {
  isArchived: boolean
  archiveLimitDate: string | null | undefined
  proposalArchivedTime: number | null | undefined
}

/**
 * A proposal no longer accepts votes once it is archived, or once its archiving deadline has passed
 * in a step configured with automatic archiving (even when the vote threshold has been reached).
 * Mirrors the backend ProposalVotePeriodChecker.
 */
export const isVotePeriodOver = (
  { isArchived, archiveLimitDate, proposalArchivedTime }: VotePeriod,
  now: Date = new Date(),
): boolean => {
  if (isArchived) return true
  if (!proposalArchivedTime || proposalArchivedTime <= 0 || !archiveLimitDate) return false

  const limitDate = moment(archiveLimitDate)

  return limitDate.isValid() && limitDate.isBefore(now)
}
