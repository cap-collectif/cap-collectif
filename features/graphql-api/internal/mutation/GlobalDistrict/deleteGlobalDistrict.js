/* eslint-env jest */
import '../../../_setup'

const DeleteGlobalDistrictMutation = /* GraphQL*/ `
    mutation ($input: DeleteGlobalDistrictInput!) {
      deleteGlobalDistrict(input: $input) {
        deletedDistrictId
        userErrors {
          message
        }
      }
    }
`

describe('mutations.deleteGlobalDistrict', () => {
  it('Admin can delete a project district', async () => {
    await expect(
      graphql(
        DeleteGlobalDistrictMutation,
        {
          input: {
            id: 'RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('Admin should receive an error when deleting an unknown project district', async () => {
    await expect(
      graphql(
        DeleteGlobalDistrictMutation,
        {
          input: {
            id: 'wrongDistrictId',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
