/* eslint-env jest */
import '../../../_setupDB'

const AnonymizeAccountByEmailMutation = /* GraphQL */ `
  mutation AnonymizeAccountByEmail($input: AnonymizeAccountByEmailInput!) {
    anonymizeAccountByEmail(input: $input) {
      email
      errorCode
    }
  }
`

const UserContentQuery = /* GraphQL */ `
  query UserContentBeforeAccountAnonymization(
    $accountId: ID!
    $openProposalId: ID!
    $closedProposalId: ID!
    $openOpinionId: ID!
    $closedOpinionId: ID!
    $openSourceId: ID!
    $openArgumentId: ID!
    $closedArgumentId: ID!
    $commentableProposalId: ID!
    $openVoteId: ID!
    $eventId: ID!
  ) {
    account: node(id: $accountId) {
      ... on User {
        id
        username
        email
        deletedAccountAt
      }
    }
    openProposal: node(id: $openProposalId) {
      ...ProposalContent
    }
    closedProposal: node(id: $closedProposalId) {
      ...ProposalContent
    }
    openOpinion: node(id: $openOpinionId) {
      ...OpinionContent
    }
    closedOpinion: node(id: $closedOpinionId) {
      ...OpinionContent
    }
    openSource: node(id: $openSourceId) {
      ...SourceContent
    }
    openArgument: node(id: $openArgumentId) {
      ...ArgumentContent
    }
    closedArgument: node(id: $closedArgumentId) {
      ...ArgumentContent
    }
    commentableProposal: node(id: $commentableProposalId) {
      ... on Proposal {
        comments {
          edges {
            node {
              ...CommentContent
            }
          }
        }
      }
    }
    openVote: node(id: $openVoteId) {
      ...ProposalVoteContent
    }
    event: node(id: $eventId) {
      ...EventContent
    }
  }

  fragment AccountFields on User {
    id
    username
    email
  }

  fragment ProposalContent on Proposal {
    id
    title
    body
    summary
    estimation
    author {
      ...AccountFields
    }
  }

  fragment OpinionContent on Opinion {
    id
    title
    body
    author {
      ...AccountFields
    }
  }

  fragment SourceContent on Source {
    id
    title
    body
    link
    author {
      ...AccountFields
    }
  }

  fragment ArgumentContent on Argument {
    id
    body
    type
    author {
      ...AccountFields
    }
  }

  fragment CommentContent on Comment {
    id
    body
    author {
      ...AccountFields
    }
    answers {
      id
      body
      author {
        ...AccountFields
      }
    }
  }

  fragment ProposalVoteContent on ProposalVote {
    id
    createdAt
    published
    ranking
    proposal {
      id
    }
    step {
      id
    }
    author {
      ...AccountFields
    }
  }

  fragment EventContent on Event {
    id
    title
    body
    link
    enabled
    timeRange {
      startAt
      endAt
    }
    author {
      ...AccountFields
    }
  }
`

const ClosedVoteQuery = /* GraphQL */ `
  query ClosedVoteBeforeAccountAnonymization($accountId: ID!, $closedVoteId: ID!) {
    account: node(id: $accountId) {
      ... on User {
        id
        username
        email
        deletedAccountAt
      }
    }
    closedVote: node(id: $closedVoteId) {
      ... on ProposalVote {
        id
        createdAt
        published
        ranking
        proposal {
          id
        }
        step {
          id
        }
        author {
          id
          username
          email
        }
      }
    }
  }
`

const anonymizeAccount = email => graphql(AnonymizeAccountByEmailMutation, { input: { email } }, 'internal_super_admin')

describe('mutations.anonymizeAccountByEmail', () => {
  it('preserves content in open and closed steps while anonymizing its author', async () => {
    const variables = {
      accountId: 'VXNlcjp1c2VyNQ==', // User:user5
      openProposalId: 'UHJvcG9zYWw6cHJvcG9zYWwy', // Proposal:proposal2
      closedProposalId: 'UHJvcG9zYWw6cHJvcG9zYWwxMg==', // Proposal:proposal12
      openOpinionId: 'T3BpbmlvbjpvcGluaW9uMTA1', // Opinion:opinion105
      closedOpinionId: 'T3BpbmlvbjpvcGluaW9uNTE=', // Opinion:opinion51
      openSourceId: 'U291cmNlOnNvdXJjZTE=', // Source:source1
      openArgumentId: 'QXJndW1lbnQ6YXJndW1lbnQx', // Argument:argument1
      closedArgumentId: 'QXJndW1lbnQ6YXJndW1lbnQxNDg=', // Argument:argument148
      commentableProposalId: 'UHJvcG9zYWw6cHJvcG9zYWwyOA==', // Proposal:proposal28
      openVoteId: 'QWJzdHJhY3RWb3RlOjEwNTM=', // AbstractVote:1053
      eventId: 'RXZlbnQ6ZXZlbnQx', // Event:event1
    }
    await expect(graphql(UserContentQuery, variables, 'internal_super_admin')).resolves.toMatchSnapshot()

    await expect(anonymizeAccount('user@test.com')).resolves.toMatchSnapshot()

    await expect(graphql(UserContentQuery, variables, 'internal_super_admin')).resolves.toMatchSnapshot({
      account: { deletedAccountAt: expect.any(String) },
    })
  })

  it('preserves a vote in a closed step while anonymizing its author', async () => {
    const variables = {
      accountId: 'VXNlcjplbWFpbGluZ1VzZXIxNw==', // User:emailingUser17
      closedVoteId: 'QWJzdHJhY3RWb3RlOjIwNzQ=', // AbstractVote:2074
    }
    await expect(graphql(ClosedVoteQuery, variables, 'internal_super_admin')).resolves.toMatchSnapshot()

    await expect(anonymizeAccount('emailing.user17@fake-email.com')).resolves.toMatchSnapshot()

    await expect(graphql(ClosedVoteQuery, variables, 'internal_super_admin')).resolves.toMatchSnapshot({
      account: { deletedAccountAt: expect.any(String) },
    })
  })
})
