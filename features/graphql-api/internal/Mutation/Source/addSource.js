/* eslint-env jest */
import '../../../_setupDB'

const AddSource = /* GraphQL*/ `
  mutation ($input: AddSourceInput!) {
    addSource(input: $input) {
      source {
        id
        published
        body
        title
        link
        category {
          id
        }
        author {
          _id
        }
      }
      sourceEdge {
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

describe('mutations.addSource', () => {
  it('User wants to add a source on an opinion', async () => {
    await expect(
      graphql(
        AddSource,
        {
          input: {
            sourceableId: 'T3BpbmlvbjpvcGluaW9uMQ==',
            link: 'http://google.com',
            title: 'Je suis une source',
            body: "<div>Jai un corps mais pas de bras :'(</div>",
            category: 'sourcecategory2',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot({
      addSource: {
        source: {
          id: expect.any(String),
        },
        sourceEdge: {
          cursor: expect.any(String),
          node: {
            id: expect.any(String),
          },
        },
      },
    })
  })

  it('User wants to add a source on an uncontributable', async () => {
    await expect(
      graphql(
        AddSource,
        {
          input: {
            sourceableId: 'T3BpbmlvbjpvcGluaW9uNjM=',
            link: 'http://google.com',
            title: 'Je suis une source',
            body: "<div>Jai un corps mais pas de bras :'(</div>",
            category: 'sourcecategory2',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User wants to add a source without meeting all requirements', async () => {
    await expect(
      graphql(
        AddSource,
        {
          input: {
            sourceableId: 'T3BpbmlvbjpvcGluaW9uMQ==',
            link: 'http://google.com',
            title: 'Je suis une source',
            body: "<div>Jai un corps mais pas de bras :'(</div>",
            category: 'sourcecategory2',
          },
        },
        'internal_jean',
      ),
    ).resolves.toMatchSnapshot()
  })
})
