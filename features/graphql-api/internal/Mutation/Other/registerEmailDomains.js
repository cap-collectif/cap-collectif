/* eslint-env jest */
import '../../../_setupDB'

const mutation = /* GraphQL */ `
  mutation RegisterEmailDomains($input: RegisterEmailDomainsInput!) {
    registerEmailDomains(input: $input) {
      domains {
        value
      }
    }
  }
`

const input = { domains: [{ value: 'gmail.com' }, { value: 'capco.com' }] }

describe('Internal|registerEmailDomains mutation', () => {
  /**
   * @jest-status compliant
   * @jest-reason Checks an awaited explicit refusal from the real GraphQL API with controlled request inputs
   * and identity.
   */
  it('denies anonymous users', async () => {
    await expect(graphql(mutation, { input }, 'internal')).rejects.toThrowError('Access denied to this field.')
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
  it('registers domains for an admin', async () => {
    await expect(graphql(mutation, { input }, 'internal_admin')).resolves.toEqual({
      registerEmailDomains: { domains: input.domains },
    })
  })
})
