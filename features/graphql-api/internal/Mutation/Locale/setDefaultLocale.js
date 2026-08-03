/* eslint-env jest */
import '../../../_setupDB'

const mutation = /* GraphQL */ `
  mutation SetDefaultLocale($input: SetDefaultLocaleInput!) {
    setDefaultLocale(input: $input) {
      locale {
        id
        isEnabled
        isPublished
        isDefault
      }
    }
  }
`

describe('Internal|setDefaultLocale mutation', () => {
  it('changes the default locale as an admin', async () => {
    await expect(graphql(mutation, { input: { id: 'locale-en-GB' } }, 'internal_admin')).resolves.toEqual({
      setDefaultLocale: {
        locale: { id: 'locale-en-GB', isEnabled: true, isPublished: true, isDefault: true },
      },
    })
  })
})
