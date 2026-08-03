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
  it('denies anonymous users', async () => {
    await expect(graphql(mutation, { input }, 'internal')).rejects.toThrowError('Access denied to this field.')
  })

  it('registers domains for an admin', async () => {
    await expect(graphql(mutation, { input }, 'internal_admin')).resolves.toEqual({
      registerEmailDomains: { domains: input.domains },
    })
  })
})
