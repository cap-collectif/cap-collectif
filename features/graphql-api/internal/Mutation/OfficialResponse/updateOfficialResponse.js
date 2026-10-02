/* eslint-env jest */
import '../../../_setupDB'

const UpdateOfficialResponseMutation = /* GraphQL*/ `
  mutation ($input: UpdateOfficialResponseInput!) {
      updateOfficialResponse(input: $input) {
        error
        officialResponse {
          body
          isPublished
          authors {
            id
          }
          proposal {
            id
          }
        }
      }
    }
`

describe('mutations.updateOfficialResponse', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL admin creates an officialResponse', async () => {
    const response = await graphql(
      UpdateOfficialResponseMutation,
      {
        input: {
          body: '<h3>Non.</h3><p>Cordialement</p>',
          isPublished: false,
          authors: ['VXNlcjp1c2VyU3B5bA=='],
          proposal: 'UHJvcG9zYWw6cHJvcG9zYWwxNw==',
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL admin unpublish an officialResponse', async () => {
    const response = await graphql(
      UpdateOfficialResponseMutation,
      {
        input: {
          id: 'T2ZmaWNpYWxSZXNwb25zZTpvZmZpY2lhbFJlc3BvbnNlMTE=',
          body: '<h3>Non.</h3><p>Cordialement</p>',
          isPublished: false,
          authors: ['VXNlcjp1c2VyU3B5bA=='],
          proposal: 'UHJvcG9zYWw6cHJvcG9zYWwxNw==',
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL admin wants to create an officialResponse but gives no author', async () => {
    const response = await graphql(
      UpdateOfficialResponseMutation,
      {
        input: {
          body: 'new body',
          isPublished: false,
          authors: [],
          proposal: 'UHJvcG9zYWw6cHJvcG9zYWwxNw==',
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL admin wants to create an officialResponse but wrong author id', async () => {
    const response = await graphql(
      UpdateOfficialResponseMutation,
      {
        input: {
          body: 'new body',
          isPublished: false,
          authors: ['wrongId'],
          proposal: 'UHJvcG9zYWw6cHJvcG9zYWwxNw==',
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })

  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('GraphQL admin wants to create an officialResponse but wrong proposal id', async () => {
    await expect(
      graphql(
        UpdateOfficialResponseMutation,
        {
          input: {
            body: 'new body',
            isPublished: false,
            authors: ['VXNlcjp1c2VyU3B5bA=='],
            proposal: 'wrongId',
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL admin wants to update an officialResponse but wrong id', async () => {
    const response = await graphql(
      UpdateOfficialResponseMutation,
      {
        input: {
          id: 'wrongId',
          body: 'new body',
          isPublished: false,
          authors: ['VXNlcjp1c2VyU3B5bA=='],
          proposal: 'UHJvcG9zYWw6cHJvcG9zYWwxNw==',
        },
      },
      'internal_admin',
    )

    expect(response).toMatchSnapshot()
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('GraphQL admin remove an author from an officialResponse', async () => {
    const response = await graphql(
      UpdateOfficialResponseMutation,
      {
        input: {
          id: 'T2ZmaWNpYWxSZXNwb25zZTpvZmZpY2lhbFJlc3BvbnNlMjI=',
          body: 'osef',
          isPublished: true,
          authors: ['VXNlcjp1c2VyU3B5bA=='],
          proposal: 'UHJvcG9zYWw6cHJvcG9zYWxJZGYz',
        },
      },
      'internal_admin',
    )

    expect(response).toMatchSnapshot()
  })
})
