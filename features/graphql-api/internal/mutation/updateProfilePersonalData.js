/* eslint-env jest */
import '../../_setup';

const UpdateProfilePersonalDataMutation = /* GraphQL*/ `
    mutation UpdateProfilePersonalDataMutation($input: UpdateProfilePersonalDataInput!) {
        updateProfilePersonalData(input: $input) {
            user {
                phone
                phoneConfirmed
            }
            errorCode
        }
    }
`;

const input = {
  "firstname": "firstname",
  "lastname": "lastname",
  "postalAddress": null,
  "address": null,
  "address2": null,
  "city": null,
  "zipCode": null,
  "phone": "+33695868423",
  "gender": null,
  "dateOfBirth": null,
  "birthPlace": "East blue"
}

describe('mutations.updateProfilePersonalData', () => {

  it('should return PHONE_SHOULD_BE_MOBILE_NUMBER errorCode', async () => {
    const response = await graphql(
      UpdateProfilePersonalDataMutation,
      {
        input: {
          ...input,
          phone: '+33195868423'
        }
      },
      'internal_admin',
    );
    expect(response.updateProfilePersonalData.errorCode).toBe('PHONE_SHOULD_BE_MOBILE_NUMBER')
  });

  it('should return PHONE_ALREADY_USED_BY_ANOTHER_USER errorCode', async () => {
    const response = await graphql(
      UpdateProfilePersonalDataMutation,
      {
        input: {
          ...input,
          phone: '+33628232323'
        }
      },
      'internal_admin',
    );
    expect(response.updateProfilePersonalData.errorCode).toBe('PHONE_ALREADY_USED_BY_ANOTHER_USER')
  });

  it('should return PHONE_INVALID_LENGTH errorCode', async () => {
    const tooShortResponse = await graphql(
      UpdateProfilePersonalDataMutation,
      {
        input: {
          ...input,
          phone: '+33623'
        }
      },
      'internal_admin',
    );
    expect(tooShortResponse.updateProfilePersonalData.errorCode).toBe('PHONE_INVALID_LENGTH')

    const tooLongResponse = await graphql(
      UpdateProfilePersonalDataMutation,
      {
        input: {
          ...input,
          phone: '+336282323231'
        }
      },
      'internal_admin',
    );
    expect(tooLongResponse.updateProfilePersonalData.errorCode).toBe('PHONE_INVALID_LENGTH')
  });
});
