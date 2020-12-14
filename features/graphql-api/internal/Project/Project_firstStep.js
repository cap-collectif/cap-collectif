/* eslint-env jest */

const ProjectFirstDebateStepQuery = /* GraphQL */ `
  query ProjectFirstDebateStepQuery($id: ID!) {
    project: node(id: $id) {
      id
      ... on Project {
        firstDebateStep {
          id
        }
      }
    }
  }
`;

const ProjectFirstCollectStepQuery = /* GraphQL */ `
  query ProjectFirstCollectStepQuery($id: ID!) {
    project: node(id: $id) {
      id
      ... on Project {
        firstCollectStep {
          id
        }
      }
    }
  }
`;

const ProjectFirstAnalysisStepQuery = /* GraphQL */ `
  query ProjectFirstAnalysisStepQuery($id: ID!) {
    project: node(id: $id) {
      id
      ... on Project {
        firstAnalysisStep {
          id
        }
      }
    }
  }
`;

describe('Internal|Project.firstStep ', () => {
  it('should return the first debate step of a project with a debate step', async () => {
    const response = await graphql(
      ProjectFirstDebateStepQuery,
      {
        id: toGlobalId('Project', 'projectCannabis'),
      },
      'internal_admin',
    );
    expect(response.project.firstDebateStep).not.toBeNull();
    expect(response.project.firstDebateStep.id).toBe(
      toGlobalId('DebateStep', 'debateStepCannabis'),
    );
  });

  it('should return null for the first debate step of a project without a debate step', async () => {
    const response = await graphql(
      ProjectFirstDebateStepQuery,
      {
        id: toGlobalId('Project', 'projectIdf'),
      },
      'internal_admin',
    );
    expect(response.project.firstDebateStep).toBeNull();
  });
  it('should return the first collect step of a project with a collect step', async () => {
    const response = await graphql(
      ProjectFirstCollectStepQuery,
      {
        id: toGlobalId('Project', 'projectIdf'),
      },
      'internal_admin',
    );
    expect(response.project.firstCollectStep).not.toBeNull();
    expect(response.project.firstCollectStep.id).toBe(toGlobalId('CollectStep', 'collectstepIdf'));
  });

  it('should return null for the first collect step of a project without a collect step', async () => {
    const response = await graphql(
      ProjectFirstCollectStepQuery,
      {
        id: toGlobalId('Project', 'projectCannabis'),
      },
      'internal_admin',
    );
    expect(response.project.firstCollectStep).toBeNull();
  });
  it('should return the first analysis step of a project with a analysis step', async () => {
    const response = await graphql(
      ProjectFirstAnalysisStepQuery,
      {
        id: toGlobalId('Project', 'projectIdf'),
      },
      'internal_admin',
    );
    expect(response.project.firstAnalysisStep).not.toBeNull();
    expect(response.project.firstAnalysisStep.id).toBe(
      toGlobalId('SelectionStep', 'selectionStepIdfAnalyse'),
    );
  });

  it('should return null for the first analysis step of a project without a analysis step', async () => {
    const response = await graphql(
      ProjectFirstAnalysisStepQuery,
      {
        id: toGlobalId('Project', 'projectCannabis'),
      },
      'internal_admin',
    );
    expect(response.project.firstAnalysisStep).toBeNull();
  });
});
