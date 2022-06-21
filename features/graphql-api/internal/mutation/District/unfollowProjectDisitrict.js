/* eslint-env jest */
import '../../../_setup';

const UnfollowProjectDistrictMutation = /* GraphQL*/ `
    mutation ($input: UnfollowProjectDistrictInput!) {
        unfollowProjectDistrict(input: $input) {
            projectDistrict {
                id
                followers {
                    totalCount
                    edges {
                        node {
                            username
                        }
                    }
                }
            }
            errorCode
        }
    }
`;

const input = {
  projectDistrictId: 'projectDistrict6',
};

describe('mutations.projectDistrict', () => {
  it('should unfollow to a project district', async () => {
    const response = await graphql(
      UnfollowProjectDistrictMutation,
      {
        input,
      },
      'internal_maxidev',
    );
    expect(response).toMatchSnapshot();
  });

  it('should return an error DISTRICT_NOT_FOUND', async () => {
    const response = await graphql(
      UnfollowProjectDistrictMutation,
      {
        input: {
          projectDistrictId: 'notExist',
        },
      },
      'internal_theo',
    );
    expect(response).toMatchSnapshot();
  });
});
