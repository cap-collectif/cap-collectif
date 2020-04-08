/* eslint-env jest */
const InternalQuery = /* GraphQL */ `
  query ViewerAssignedProjectsToAnalyse {
    viewerAssignedProjectsToAnalyse {
      title
      analysts {
        id
        username
      }
      supervisors {
          id
          username
      }
      decisionMakers {
          id
          username
      }
      viewerAssignedProposals {
      totalCount
      edges{
        node {
          id
          title
        }
      }
    }
    }
  }
`;

describe('Internal|Query.viewerAssignedProjectsToAnalyse', () => {
  it('fetches all analyst, supervisors and decisionMakers assigned to my projects; Logged as supervisor', async () => {
    await expect(graphql(InternalQuery, {}, 'internal_supervisor')).resolves.toMatchSnapshot();
  });
  it('fetches all analyst, supervisors and decisionMakers assigned to my projects; Logged as decision maker', async () => {
    await expect(graphql(InternalQuery, {}, 'internal_decision_maker')).resolves.toMatchSnapshot();
  });
  it('fetches all analyst, supervisors and decisionMakers assigned to my projects; Logged as analyst', async () => {
    await expect(graphql(InternalQuery, {}, 'internal_analyst')).resolves.toMatchSnapshot();
  });
  it('fetches all analyst, supervisors and decisionMakers assigned to my projects; Logged as admin', async () => {
    await expect(graphql(InternalQuery, {}, 'internal_admin')).resolves.toMatchSnapshot();
  });
});
