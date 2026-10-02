/* eslint-env jest */
const internalFormQueries = [
  {
    field: 'proposalForms',
    query: /* GraphQL */ `
      query ProposalFormsQuery {
        proposalForms {
          title
        }
      }
    `,
  },
  {
    field: 'availableQuestionnaires',
    query: /* GraphQL */ `
      query AvailableQuestionnairesQuery {
        availableQuestionnaires {
          title
        }
      }
    `,
  },
]

describe('Internal|Query internal forms', () => {
  /**
   * @jest-status compliant
   * @jest-reason Checks an explicit result or refusal from the real GraphQL read contract using stable
   * fixture data.
   */
  it.each(internalFormQueries)('denies non-admin access to $field', async ({ field, query }) => {
    const response = await rawInternalGraphql(query, {}, { email: 'user@test.com', password: 'user' })

    expect(response.extensions.warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: 'Access denied to this field.', path: [field] })]),
    )
  })

  /**
   * @jest-status non-compliant
   * @jest-reason Checks only presence or a positive count instead of the expected API data or authorization
   * contract.
   */
  it.each(internalFormQueries)('allows admin access to $field', async ({ query }) => {
    await expect(graphql(query, {}, 'internal_admin')).resolves.toBeDefined()
  })
})
