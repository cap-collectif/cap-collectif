/* eslint-env jest */
import '../../../_setupDB'

const AddArgumentMutation = /* GraphQL*/ `
    mutation ($input: AddArgumentInput!) {
      addArgument(input: $input) {
        argument {
          id
          published
          body
          type
          author {
            _id
          }
        }
        argumentEdge {
          cursor
          node {
            id
          }
        }
        userErrors {
          message
        }
      }
    }
`

describe('mutations.addArgumentMutation', () => {
  it('User wants to add an argument on an opinion', async () => {
    await expect(
      graphql(
        AddArgumentMutation,
        {
          input: {
            argumentableId: 'T3BpbmlvbjpvcGluaW9uNTc=',
            body: 'Tololo',
            type: 'FOR',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      addArgument: {
        argument: {
          id: expect.any(String),
        },
        argumentEdge: {
          node: {
            id: expect.any(String),
          },
        },
      },
    })
  })

  it('User wants to add an argument on an opinion without requirements', async () => {
    await expect(
      graphql(
        AddArgumentMutation,
        {
          input: {
            argumentableId: 'T3BpbmlvbjpvcGluaW9uMQ==',
            body: 'Tololo',
            type: 'FOR',
          },
        },
        'internal_jean',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User wants to add an argument on an uncontibuable opinion', async () => {
    await expect(
      graphql(
        AddArgumentMutation,
        {
          input: {
            argumentableId: 'T3BpbmlvbjpvcGluaW9uNjM=',
            body: 'Tololo',
            type: 'FOR',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it("User can't add more than 2 arguments in a minute", async () => {
    await graphql(
      AddArgumentMutation,
      {
        input: {
          argumentableId: 'T3BpbmlvbjpvcGluaW9uNTc=',
          body: 'Tololo',
          type: 'FOR',
        },
      },
      'internal_user',
    )

    await graphql(
      AddArgumentMutation,
      {
        input: {
          argumentableId: 'T3BpbmlvbjpvcGluaW9uNTc=',
          body: 'Tololo',
          type: 'FOR',
        },
      },
      'internal_user',
    )

    await expect(
      graphql(
        AddArgumentMutation,
        {
          input: {
            argumentableId: 'T3BpbmlvbjpvcGluaW9uNTc=',
            body: 'Tololo',
            type: 'FOR',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
