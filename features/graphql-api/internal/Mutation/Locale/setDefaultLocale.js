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

/**
 * @jest-status non-compliant
 * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
 * the database helper runs only before each test.
 */
describe('Internal|setDefaultLocale mutation', () => {
  it('changes the default locale as an admin', async () => {
    await expect(graphql(mutation, { input: { id: 'locale-en-GB' } }, 'internal_admin')).resolves.toEqual({
      setDefaultLocale: {
        locale: { id: 'locale-en-GB', isEnabled: true, isPublished: true, isDefault: true },
      },
    })
  })
})
