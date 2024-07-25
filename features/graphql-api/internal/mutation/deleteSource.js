/* eslint-env jest */
import '../../_setup';

const DeleteSource = /* GraphQL*/ `
  mutation DeleteSource($input: DeleteSourceInput!) {
    deleteSource(input: $input) {
      deletedSourceId
    }
  }
`;

const input = {
  sourceId: toGlobalId('Source', 'source6') //U291cmNlOnNvdXJjZTY=
};

describe('mutations.deleteSource', () => {
  it('should delete a Source as an admin', async () => {
    const response = await graphql(
      DeleteSource,
      {
        input,
      },
      'internal_admin',
    );
    expect(response).toMatchSnapshot();
  });
})