/* eslint-env jest */

const ViewerQuery = /* GraphQL */ `
  query ViewerQuery {
    viewer {
      openidId
      analysisUrl
      url
      adminHomeUrl
    }
  }
`;

describe('Internal.viewer.posts', () => {
  it('should correctly fetch admin viewer', async () => {
    await expect(graphql(ViewerQuery, null, 'internal_admin')).resolves.toMatchSnapshot();
  });
  it('should correctly fetch theo viewer', async () => {
    await expect(graphql(ViewerQuery, null, 'internal_theo')).resolves.toMatchSnapshot();
  });
  it('should correctly fetch evaluer viewer', async () => {
    await expect(graphql(ViewerQuery, null, 'internal_evaluer')).resolves.toMatchSnapshot();
  });
  it('should correctly fetch supervisor viewer', async () => {
    await expect(graphql(ViewerQuery, null, 'internal_supervisor')).resolves.toMatchSnapshot();
  });
  it('should correctly fetch analyst viewer', async () => {
    await expect(graphql(ViewerQuery, null, 'internal_analyst')).resolves.toMatchSnapshot();
  });
  it('should correctly fetch project admin viewer', async () => {
    await expect(graphql(ViewerQuery, null, 'internal_project_admin')).resolves.toMatchSnapshot();
  });
  it('should correctly fetch not confirmed viewer', async () => {
    await expect(graphql(ViewerQuery, null, 'internal_not_confirmed')).rejects.toThrowError(
      'Access denied to this field.',
    );
  });
});
