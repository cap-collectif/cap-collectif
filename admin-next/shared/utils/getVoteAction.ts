export type VoteAction = 'VOTE' | 'SUPPORT' | 'SIGN'

// Normalizes the GraphQL ActionButtonLabel enum value, falling back to VOTE for null or unknown values
export const getVoteAction = (actionButtonLabel: string | null | undefined): VoteAction =>
  actionButtonLabel === 'SUPPORT' || actionButtonLabel === 'SIGN' ? actionButtonLabel : 'VOTE'

export default getVoteAction
