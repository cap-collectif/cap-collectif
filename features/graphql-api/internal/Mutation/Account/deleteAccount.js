/* eslint-env jest */
import '../../../_setupWithES'

const StepQuery = /* GraphQL */ `
  query ($stepId: ID!) {
    step: node(id: $stepId) {
      ... on ProposalStep {
        proposals(orderBy: { field: CREATED_AT, direction: ASC }) {
          totalCount
          edges {
            node {
              id
              title
              body
              createdAt
              published
              author {
                id
              }
            }
          }
        }
      }
    }
  }
`

const DeleteAccountMutation = /* GraphQL*/ `
  mutation($input: DeleteAccountInput!) {
    deleteAccount(input: $input) {
      userId
    }
  }
`

describe('mutations.deleteAccount', () => {
  it('User5 who decides to hard delete his account should have his content anonymised (closed step).', async () => {
    await expect(
      graphql(
        StepQuery,
        {
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXA0',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        DeleteAccountMutation,
        {
          input: {
            type: 'HARD',
            userId: 'VXNlcjp1c2VyNQ==',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        StepQuery,
        {
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXA0',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User who decides to hard delete his account should have his content deleted in open projects.', async () => {
    await expect(
      graphql(
        StepQuery,
        {
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        DeleteAccountMutation,
        {
          input: {
            type: 'HARD',
            userId: 'VXNlcjp1c2VyNQ==',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()

    // One proposal has been removed but needs to reindex to change totalCount
    await expect(
      graphql(
        StepQuery,
        {
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User5 who decides to soft delete his account should have his content kept readable (closed step).', async () => {
    await expect(
      graphql(
        DeleteAccountMutation,
        {
          input: {
            type: 'SOFT',
            userId: 'VXNlcjp1c2VyNQ==',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()

    // One proposal has been removed but needs to reindex to change totalCount
    await expect(
      graphql(
        StepQuery,
        {
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXA0',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User who decides to soft delete his account should not have his content kept in open projects.', async () => {
    await expect(
      graphql(
        DeleteAccountMutation,
        {
          input: {
            type: 'SOFT',
            userId: 'VXNlcjp1c2VyNQ==',
          },
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        StepQuery,
        {
          stepId: 'Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx',
        },
        'internal_super_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
