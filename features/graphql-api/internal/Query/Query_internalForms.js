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
  it.each(internalFormQueries)('denies non-admin access to $field', async ({ field, query }) => {
    const response = await rawInternalGraphql(query, {}, { email: 'user@test.com', password: 'user' })

    expect(response.extensions.warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: 'Access denied to this field.', path: [field] })]),
    )
  })

  it.each(internalFormQueries)('allows admin access to $field', async ({ query }) => {
    await expect(graphql(query, {}, 'internal_admin')).resolves.toBeDefined()
  })
})
