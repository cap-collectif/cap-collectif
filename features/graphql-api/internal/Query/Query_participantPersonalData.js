/* eslint-env jest */

const ParticipantPersonalDataQuery = /* GraphQL */ `
  query ParticipantPersonalDataQuery($participantId: ID!) {
    participant: node(id: $participantId) {
      ... on Participant {
        email
        firstname
        lastname
        phone
        dateOfBirth
        zipCode
      }
    }
  }
`

const ParticipantByTokenQuery = /* GraphQL */ `
  query ParticipantByTokenQuery($token: String!) {
    participant(token: $token) {
      email
    }
  }
`

const UserSearchQuery = /* GraphQL */ `
  query UserSearchQuery {
    userSearch {
      email
    }
  }
`

describe('Internal|Participant personal data', () => {
  it('denies anonymous access to the contributor search', async () => {
    const response = await rawInternalGraphql(UserSearchQuery, {})

    expect(response.data.userSearch).toBeNull()
    expect(response.extensions.warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: 'Access denied to this field.' })]),
    )
  })

  it('hides participant personal data from anonymous viewers', async () => {
    const response = await rawInternalGraphql(ParticipantPersonalDataQuery, {
      participantId: toGlobalId('Participant', 'participant1'),
    })

    expect(response.data.participant).toEqual({
      email: null,
      firstname: null,
      lastname: null,
      phone: null,
      dateOfBirth: null,
      zipCode: null,
    })
    expect(response.extensions.warnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: 'Access denied to this field.' })]),
    )
  })

  it('returns personal data when the participant provides their token', async () => {
    await expect(graphql(ParticipantByTokenQuery, { token: 'fakeToken1' }, 'internal')).resolves.toEqual({
      participant: { email: 'participant1@cap-collectif.com' },
    })
  })

  it('returns participant personal data to a back-office user', async () => {
    const response = await graphql(
      ParticipantPersonalDataQuery,
      { participantId: toGlobalId('Participant', 'participant1') },
      'internal_admin',
    )

    expect(response.participant.email).toBe('participant1@cap-collectif.com')
  })
})
