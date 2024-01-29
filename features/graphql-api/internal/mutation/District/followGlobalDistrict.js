/* eslint-env jest */
import '../../../_setup';

const FollowGlobalDistrictMutation = /* GraphQL*/ `
    mutation ($input: FollowGlobalDistrictInput!) {
        followGlobalDistrict(input: $input) {
            globalDistrict {
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
  globalDistrictId: 'globalDistrict5',
  notifiedOf: 'ALL',
};

describe('mutations.globalDistrict', () => {
  it('should follow to a project district', async () => {
    const response = await graphql(
      FollowGlobalDistrictMutation,
      {
        input,
      },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });

  it('should return an error DISTRICT_NOT_FOUND', async () => {
    const response = await graphql(
      FollowGlobalDistrictMutation,
      {
        input: {
          globalDistrictId: 'notExist',
          notifiedOf: 'ALL',
        },
      },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
});
