/* eslint-env jest */
import '../../../../_setupDB'

const UpdateProfilePersonalDataMutation = /* GraphQL*/ `
    mutation UpdateProfilePersonalDataMutation($input: UpdateProfilePersonalDataInput!) {
        updateProfilePersonalData(input: $input) {
            user {
                firstname
                lastname
                username
                zipCode
                postalAddress {
                  formatted
                }
                phone
                phoneConfirmed
                gender
                dateOfBirth
                birthPlace
                media {
                    id
                    name
                    url
                }
                consentPrivacyPolicy
            }
            errorCode
        }
    }
`

const input = {
  firstname: 'firstname',
  lastname: 'lastname',
  username: 'username',
  postalAddress: null,
  address: null,
  address2: null,
  city: null,
  zipCode: null,
  phone: '+33611111111',
  gender: null,
  dateOfBirth: null,
  birthPlace: 'East blue',
  media: 'ProfilePicAgui',
  consentPrivacyPolicy: true,
}

describe('mutations.updateProfilePersonalData', () => {
  /**
   * @jest-status non-compliant
   * @jest-reason Checks mutation output without a failure-safe final restoration of the changed backend data;
   * the database helper runs only before each test.
   */
  it('should return PHONE_INVALID_LENGTH errorCode', async () => {
    const tooShortResponse = await graphql(
      UpdateProfilePersonalDataMutation,
      {
        input: {
          ...input,
          phone: '+33623',
        },
      },
      'internal_admin',
    )
    expect(tooShortResponse.updateProfilePersonalData.errorCode).toBe('PHONE_INVALID_LENGTH')

    const tooLongResponse = await graphql(
      UpdateProfilePersonalDataMutation,
      {
        input: {
          ...input,
          phone: '+336282323231',
        },
      },
      'internal_admin',
    )
    expect(tooLongResponse.updateProfilePersonalData.errorCode).toBe('PHONE_INVALID_LENGTH')
  })
  /**
   * @jest-status non-compliant
   * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
   */
  it('should return updated profile personal data', async () => {
    const updateProfilePersonalData = await graphql(
      UpdateProfilePersonalDataMutation,
      {
        input: {
          ...input,
        },
      },
      'internal_admin',
    )
    expect(updateProfilePersonalData).toMatchSnapshot()
  })
})
