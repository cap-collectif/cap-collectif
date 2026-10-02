/* eslint-env jest */

const OpinionUrlQuery = /* GraphQL */ `
  query ($opinionId: ID!) {
    opinion: node(id: $opinionId) {
      ... on Opinion {
        url
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal|Opinion.url', () => {
  it("gets an opinion's url anonymously", async () => {
    await expect(
      graphql(
        OpinionUrlQuery,
        {
          opinionId: 'T3BpbmlvbjpvcGluaW9uNTc=',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
