/* eslint-env jest */
import '../../../_setup'

const UpdateLocaleStatus = /* GraphQL*/ `
  mutation ($input: UpdateLocaleStatusInput!) {
      updateLocaleStatus(input: $input) {
        locales {
          edges {
            node {
              id
              isEnabled
              isPublished
              isDefault
            }
          }
        }
      }
    }
`

describe('mutations|updateLocaleStatus', () => {
  it('GraphQL admin wants to update status of two locales', async () => {
    const variables = {
      input: {
        locales: [
          { id: 'locale-de-DE', isEnabled: true, isPublished: true },
          { id: 'locale-es-ES', isEnabled: true },
        ],
      },
    }

    await expect(graphql(UpdateLocaleStatus, variables, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to publish a disabled language and get error', async () => {
    const variables = {
      input: {
        locales: [{ id: 'locale-de-DE', isEnabled: false, isPublished: true }],
      },
    }

    await expect(graphql(UpdateLocaleStatus, variables, 'internal_admin')).rejects.toThrowError(
      'Locale configuration error',
    )
  })
})
