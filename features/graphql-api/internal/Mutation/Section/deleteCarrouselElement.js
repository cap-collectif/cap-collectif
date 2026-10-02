/* eslint-env jest */
import '../../../_setupDB'

const DeleteCarrouselElement = /* GraphQL*/ `
  mutation deleteCarrouselElement($input: DeleteCarrouselElementInput!) {
    deleteCarrouselElement(input: $input) {
      deletedCarrouselElementId
    }
  }
`

const input = {
  id: 'U2VjdGlvbkNhcnJvdXNlbEVsZW1lbnQ6U2VjdGlvbkNhcnJvdXNlbEVsZW1lbnQx',
}

describe('mutations.deleteCarrouselElement', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should delete a deleteCarrouselElement as an admin', async () => {
    await expect(
      graphql(
        DeleteCarrouselElement,
        {
          input,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('should not delete a deleteCarrouselElement as user', async () => {
    await expect(
      graphql(
        DeleteCarrouselElement,
        {
          input,
        },
        'internal_user',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
