/* eslint-env jest */
import '../../../_setupDB'
import '../../../_setupES'

const RemoveCommentVoteMutation = /* GraphQL*/ `
    mutation ($input: RemoveCommentVoteInput!) {
      removeCommentVote(input: $input) {
        contribution {
          id
          votes(first: 0) {
            totalCount
          }
        }
        deletedVoteId
      }
    }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.removeCommentVoteMutation', () => {
  it('Logged in API super admin wants to remove a vote for an comment', async () => {
    await expect(
      graphql(
        RemoveCommentVoteMutation,
        {
          input: {
            commentId: 'Q29tbWVudDpldmVudENvbW1lbnQx',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
