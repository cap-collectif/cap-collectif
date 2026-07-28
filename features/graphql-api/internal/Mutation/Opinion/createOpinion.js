/* eslint-env jest */
import '../../../_setupDB'

const mutation = /* GraphQL */ `
  mutation CreateOpinionMutation($input: CreateOpinionInput!) {
    createOpinion(input: $input) {
      opinion {
        title
        url
      }
      errorCode
    }
  }
`

const validInput = {
  projectId: 'project5',
  stepId: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDU=',
  opinionTypeId: 'opinionType10',
  title: 'le titre',
  body: '<p>le body</p>',
  appendices: [],
}

describe('Internal|create opinion', () => {
  it('creates an opinion for an authenticated user', async () => {
    const response = await graphql(mutation, { input: validInput }, 'internal_admin')

    expect(response.createOpinion).toMatchObject({ errorCode: null, opinion: { title: 'le titre' } })
    expect(response.createOpinion.opinion.url).toBe(
      'https://capco.test/consultations/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/les-enjeux/le-titre',
    )
  })

  it('requires authentication', async () => {
    await expect(graphql(mutation, { input: validInput }, 'internal')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })

  it.each([
    [
      'disabled opinion type',
      { projectId: 'project1', stepId: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE=', opinionTypeId: 'opinionType1' },
      'OPINION_TYPE_NOT_ENABLED',
    ],
    ['unknown project', { projectId: 'abc', opinionTypeId: 'opinionType7' }, 'PROJECT_NOT_FOUND'],
    ['unknown opinion type', { opinionTypeId: 'abc' }, 'OPINION_TYPE_NOT_FOUND'],
    [
      'invalid appendix type',
      { opinionTypeId: 'opinionType7', appendices: [{ appendixType: '3', body: 'invalid' }] },
      'INVALID_FORM',
    ],
  ])('returns %s validation error', async (_label, input, errorCode) => {
    const response = await graphql(mutation, { input: { ...validInput, ...input } }, 'internal_user')

    expect(response.createOpinion).toEqual({ opinion: null, errorCode })
  })

  it('creates an opinion with appendices', async () => {
    const response = await graphql(
      mutation,
      {
        input: {
          ...validInput,
          opinionTypeId: 'opinionType5',
          appendices: [
            { appendixType: '1', body: 'Voici mon exposé des motifs' },
            { appendixType: '2', body: "Voici mon étude d'impact" },
          ],
        },
      },
      'internal_user',
    )

    expect(response.createOpinion).toMatchObject({ errorCode: null, opinion: { title: 'le titre' } })
  })

  it('enforces contribution requirements and the rate limit', async () => {
    const missingRequirements = await graphql(
      mutation,
      {
        input: {
          ...validInput,
          projectId: 'project1',
          stepId: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE=',
          opinionTypeId: 'opinionType9',
        },
      },
      { email: 'user_without_phone@test.com', password: 'user_without_phone' },
    )
    expect(missingRequirements.createOpinion).toEqual({ opinion: null, errorCode: 'REQUIREMENTS_NOT_MET' })

    await graphql(
      mutation,
      {
        input: {
          ...validInput,
          projectId: 'project1',
          stepId: 'Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE=',
          opinionTypeId: 'opinionType9',
        },
      },
      'internal_user',
    )
    await graphql(mutation, { input: validInput }, 'internal_user')
    const response = await graphql(mutation, { input: validInput }, 'internal_user')

    expect(response.createOpinion).toEqual({ opinion: null, errorCode: 'CONTRIBUTED_TOO_MANY_TIMES' })
  })
})
