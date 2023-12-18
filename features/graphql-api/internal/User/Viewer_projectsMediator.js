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
`;

describe('Internal.viewer.projectsMediator', () => {
  beforeEach(async () => {
    await global.enableFeatureFlag('mediator');
  });
  it('should fetch mediators projects, steps and votes', async () => {
    const response = await graphql(
      ViewerProjectsMediatorQuery,
      {},
      'mediator',
    );
    expect(response).toMatchSnapshot();
  });
});
