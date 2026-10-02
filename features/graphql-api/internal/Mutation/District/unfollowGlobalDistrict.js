/* eslint-env jest */
import '../../../_setupDB'

const UnfollowGlobalDistrictMutation = /* GraphQL*/ `
    mutation ($input: UnfollowGlobalDistrictInput!) {
        unfollowGlobalDistrict(input: $input) {
            globalDistrict {
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
`

const input = {
  globalDistrictId: 'globalDistrict6',
}

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.globalDistrict', () => {
  it('should unfollow to a global district', async () => {
    const response = await graphql(
      UnfollowGlobalDistrictMutation,
      {
        input,
      },
      'internal_maxidev',
    )
    expect(response).toMatchSnapshot()
  })

  it('should return an error DISTRICT_NOT_FOUND', async () => {
    const response = await graphql(
      UnfollowGlobalDistrictMutation,
      {
        input: {
          globalDistrictId: 'notExist',
        },
      },
      'internal_theo',
    )
    expect(response).toMatchSnapshot()
  })
})
