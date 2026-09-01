/* eslint-env jest */

const ConsultationUserHasVoteQuery = /* GraphQL */ `
  query ($consultationId: ID!, $loginA: String!, $loginB: String!, $loginC: String!) {
    consultation: node(id: $consultationId) {
      ... on Consultation {
        spylHasVote: userHasVote(login: $loginA)
        lbrunetHasVote: userHasVote(login: $loginB)
        unknownUserHasVote: userHasVote(login: $loginC)
      }
    }
  }
`

describe('Internal|Consultation.userHasVote', () => {
  it('checks whether users voted on a consultation', async () => {
    await expect(
      graphql(
        ConsultationUserHasVoteQuery,
        {
          consultationId: 'Q29uc3VsdGF0aW9uOmRlZmF1bHQ=',
          loginA: 'aurelien@cap-collectif.com',
          loginB: 'lbrunet@cap-collectif.com',
          loginC: 'unknown@gmail.com',
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })
})
