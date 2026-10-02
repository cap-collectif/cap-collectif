const ViewerProjectsMediatorQuery = /* GraphQL */ `
  query ViewerProjectsMediatorQuery {
    viewer {
      projectsMediator {
        totalCount
        edges {
          node {
            title
            steps {
              title
              mediators {
                edges {
                  node {
                    votes {
                      edges {
                        node {
                          id
                          isAccounted
                          participant {
                            email
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('Internal.viewer.projectsMediator', () => {
  it('should fetch mediators projects, steps and votes', async () => {
    const response = await graphql(ViewerProjectsMediatorQuery, {}, 'mediator')
    expect(response).toMatchSnapshot()
  })
})
