type ProposalAuthor = {
  readonly username?: string | null
}

export const getProposalAuthorDisplayName = (author: ProposalAuthor | null | undefined): string =>
  author?.username || 'Anonyme'
