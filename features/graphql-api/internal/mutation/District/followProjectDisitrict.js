/* eslint-env jest */
import '../../../_setup';

const FollowProjectDistrictMutation = /* GraphQL*/ `
    mutation ($input: FollowProjectDistrictInput!) {
        followProjectDistrict(input: $input) {
            projectDistrict {
                id
            }
            followerEdge {
                node {
                    id
                }
            }
            errorCode
        }
    }
`;

const input = {
  projectDistrictId: 'projectDistrict5',
  notifiedOf: 'ALL',
};

describe('mutations.projectDistrict', () => {
  it('should follow to a project district', async () => {
    const response = await graphql(
      FollowProjectDistrictMutation,
      {
        input,
      },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });

  it('should return an error DISTRICT_NOT_FOUND', async () => {
    const response = await graphql(
      FollowProjectDistrictMutation,
      {
        input: {
          projectDistrictId: 'notExist',
          notifiedOf: 'ALL',
        },
      },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
});
