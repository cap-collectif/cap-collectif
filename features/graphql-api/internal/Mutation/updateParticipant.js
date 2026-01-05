import '../../_setup'

const UpdateParticipant = /* GraphQL */ `
  mutation UpdateParticipantMutation($input: UpdateParticipantInput!) {
    updateParticipant(input: $input) {
      participant {
        firstname
        lastname
        phone
        zipCode
        postalAddress {
          formatted
        }
        dateOfBirth
        consentInternalCommunication
        consentPrivacyPolicy
        userIdentificationCode
      }
      validationErrors
    }
  }
`

const baseInput = {
  token: 'fakeToken1',
  firstname: 'new firstname',
  lastname: 'new lastname',
  postalAddress:
    '[{"address_components":[{"long_name":"10","short_name":"10","types":["street_number"]},{"long_name":"RuedelaSavate","short_name":"RuedelaSavate","types":["route"]},{"long_name":"Awans","short_name":"Awans","types":["locality","political"]},{"long_name":"Liège","short_name":"LG","types":["administrative_area_level_2","political"]},{"long_name":"RégionWallonne","short_name":"RégionWallonne","types":["administrative_area_level_1","political"]},{"long_name":"Belgium","short_name":"BE","types":["country","political"]},{"long_name":"4340","short_name":"4340","types":["postal_code"]}],"formatted_address":"RuedelaSavate10,4340Awans,Belgium","geometry":{"location":{"lat":50.7228035,"lng":5.464624},"location_type":"ROOFTOP","viewport":{"south":50.7214585197085,"west":5.463225469708497,"north":50.72415648029149,"east":5.465923430291502}},"place_id":"ChIJ1T224zPjwEcR1kNhE8iPg_k","plus_code":{"compound_code":"PFF7+4RAwans,Belgium","global_code":"9F27PFF7+4R"},"types":["street_address"]}]',
  dateOfBirth: '2000-01-01 00:00:00',
  phone: '+33601010101',
  zipCode: '75001',
  consentInternalCommunication: true,
  consentPrivacyPolicy: true,
  userIdentificationCode: null,
}

describe('mutations.updateParticipant', () => {
  it('should update participant', async () => {
    await expect(graphql(UpdateParticipant, { input: baseInput }, 'internal_user')).resolves.toMatchSnapshot()
  })

  it('should return BAD_CODE validation errors when attempting to use a non existing identification code', async () => {
    await expect(
      graphql(UpdateParticipant, { input: { ...baseInput, userIdentificationCode: 'WrongCode' } }, 'internal_user'),
    ).resolves.toMatchSnapshot()
  })

  it('should return CODE_ALREADY_USED validation errors when attempting to use an identification code already used by another user/participant', async () => {
    await expect(
      graphql(UpdateParticipant, { input: { ...baseInput, userIdentificationCode: 'DK2AZ554' } }, 'internal_user'),
    ).resolves.toMatchSnapshot()
  })
})
