/* eslint-env jest */

const ProposalResponsesQuery = /* GraphQL */ `
  query ProposalResponsesQuery($id: ID!, $isAuthenticated: Boolean!) {
    viewer @include(if: $isAuthenticated) {
      id
      isAdmin
    }
    proposal: node(id: $id) {
      ... on Proposal {
        author {
          id
        }
        evaluers {
          users {
            edges {
              node {
                id
              }
            }
          }
        }
        responses {
          ... on ValueResponse {
            value
          }
          question {
            id
            private
          }
        }
      }
    }
  }
`

const ProposalResponsesAnalystQuery = /* GraphQL */ `
  query ProposalResponsesQuery($id: ID!, $isAuthenticated: Boolean!) {
    viewer @include(if: $isAuthenticated) {
      id
      isAdmin
    }
    proposal: node(id: $id) {
      ... on Proposal {
        author {
          id
        }
        analysts {
          id
        }
        responses {
          ... on ValueResponse {
            value
          }
          question {
            id
            private
          }
        }
      }
    }
  }
`

const proposalId = 'UHJvcG9zYWw6cHJvcG9zYWwy'

describe('Proposal.responses array', () => {
  it("fetches only a proposal's public responses when not authenticated.", async () => {
    await Promise.all(
      [proposalId].map(async id => {
        await expect(
          graphql(
            ProposalResponsesQuery,
            {
              id: id,
              isAuthenticated: false,
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(id)
      }),
    )
  })

  it("fetches a proposal's private responses when author.", async () => {
    await Promise.all(
      [proposalId].map(async id => {
        const response = await graphql(
          ProposalResponsesQuery,
          {
            id: id,
            isAuthenticated: true,
          },
          'internal_user',
        )
        expect(response).toMatchSnapshot(id)
        expect(response.viewer.id).toBe(response.proposal.author.id)
      }),
    )
  })

  it("fetches a proposal's private responses when admin.", async () => {
    await Promise.all(
      [proposalId].map(async id => {
        const response = await graphql(
          ProposalResponsesQuery,
          {
            id: id,
            isAuthenticated: true,
          },
          'internal_admin',
        )
        expect(response).toMatchSnapshot(id)
        expect(response.viewer.isAdmin).toBe(true)
      }),
    )
  })

  it("fetches a proposal's private responses when evaluer on this proposal.", async () => {
    await Promise.all(
      [proposalId].map(async id => {
        const response = await graphql(
          ProposalResponsesQuery,
          {
            id: id,
            isAuthenticated: true,
          },
          'internal_kiroule',
        )
        expect(response).toMatchSnapshot(id)
        expect(response.proposal.evaluers[1].users.edges).toEqual(
          expect.arrayContaining([{ node: { id: response.viewer.id } }]),
        )
      }),
    )
  })

  it("fetches only a proposal's public responses when user is evaluer but not on this proposal.", async () => {
    await Promise.all(
      [proposalId].map(async id => {
        const response = await graphql(
          ProposalResponsesQuery,
          {
            id: id,
            isAuthenticated: true,
          },
          'internal_user_conseil_regional',
        )
        expect(response).toMatchSnapshot(id)
        expect(response.proposal.evaluers[1].users.edges).not.toEqual(
          expect.arrayContaining([{ node: { id: response.viewer.id } }]),
        )
      }),
    )
  })

  it("fetches proposal's private responses when user is analyst on this proposal.", async () => {
    await Promise.all(
      ['UHJvcG9zYWw6cHJvcG9zYWxJZGYx'].map(async id => {
        const response = await graphql(
          ProposalResponsesAnalystQuery,
          {
            id: id,
            isAuthenticated: true,
          },
          'internal_theo',
        )
        expect(response).toMatchSnapshot(id)
        expect(response.proposal.analysts).toEqual(expect.arrayContaining([{ id: response.viewer.id }]))
      }),
    )
  })
})
