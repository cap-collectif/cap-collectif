/* eslint-env jest */
import '../../../_setupDB'

const mutation = /* GraphQL */ `
  mutation SetUserDefaultLocale($input: SetUserDefaultLocaleInput!) {
    setUserDefaultLocale(input: $input) {
      code
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
 * the database helper runs only before each test.
 */
describe('Internal|setUserDefaultLocale mutation', () => {
  it('changes a user default locale as an admin', async () => {
    await expect(
      graphql(mutation, { input: { userId: toGlobalId('User', 'user5'), code: 'en-GB' } }, 'internal_admin'),
    ).resolves.toEqual({ setUserDefaultLocale: { code: 'en-GB' } })
  })
})
