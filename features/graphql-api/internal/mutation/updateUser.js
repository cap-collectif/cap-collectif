import '../../resetDatabaseBeforeEach';

const UpdateUserMutation = /* GraphQL */ `
  mutation UpdateUserMutation($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        firstname
        lastname
        gender
        dateOfBirth
        postalAddress {
          json
          formatted
        }
        address
        address2
        city
        zipCode
        phone
        phoneConfirmed
        email
        birthPlace
        userIdentificationCode
        username
        biography
        neighborhood
        websiteUrl
        linkedInUrl
        facebookUrl
        twitterUrl
        instagramUrl
        profilePageIndexed
        roles
        locked
        vip
        enabled
        isSubscribedToProposalNews
      }
      validationErrors
    }
  }
`;

  const input = {
    "userId": "VXNlcjp1c2VyMQ==", // User:user1
    "firstname": "firstname",
    "lastname": "lastname",
    "gender": "MALE",
    "phone": "+33695868423",
    "postalAddress": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
    "address": "address",
    "address2": "address2",
    "city": "city",
    "zipCode": "77185",
    "dateOfBirth": "1994-09-22",
    "phoneConfirmed": false,
    "email": "lbrunet@cap-collectif.com",
    "birthPlace": "paris",
    "userIdentificationCode": "GG2AZR54",
    "username": "username",
    "userType": "VXNlclR5cGU6MQ==", // UserType:1
    "biography": "",
    "neighborhood": "neighborhood",
    "websiteUrl": "websiteUrl",
    "linkedInUrl": "linkedInUrl",
    "facebookUrl": "facebookUrl",
    "twitterUrl": "twitterUrl",
    "instagramUrl": "instagramUrl",
    "profilePageIndexed": true,
    "media": null,
    "roles": [
      "ROLE_USER",
      "ROLE_ADMIN",
      "ROLE_SUPER_ADMIN"
    ],
    "locked": true,
    "vip": false,
    "enabled": false,
    "subscribedToProposalNews": true
  }

describe('mutations.updateUserMutation', () => {
  beforeEach(async () => {
    await global.enableFeatureFlag('user_type');
  })

  it('should update user', async () => {
    await expect(
      graphql(
        UpdateUserMutation,
        { input: input },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });

  it('should return PHONE_INVALID_LENGTH validation error', async () => {
    const tooShortResponse = await graphql(
      UpdateUserMutation,
      {
        input: {
          ...input,
          phone: '+33623',
        },
      },
      'internal_admin',
    );
    expect(tooShortResponse.updateUser.validationErrors).toBe("{\"phone\":\"PHONE_INVALID_LENGTH\"}");

    const tooLongResponse = await graphql(
      UpdateUserMutation,
      {
        input: {
          ...input,
          phone: '+336282323231',
        },
      },
      'internal_admin',
    );
    expect(tooLongResponse.updateUser.validationErrors).toBe("{\"phone\":\"PHONE_INVALID_LENGTH\"}");
  });

  it('should return CODE_ALREADY_USED validation error when attempting to add an identification code, but code is already used', async () => {
    const response = await graphql(
      UpdateUserMutation,
      {
        input: {
          ...input,
          userIdentificationCode: 'DK2AZ554',
        },
      },
      'internal_admin',
    );
    expect(response.updateUser.validationErrors).toBe("{\"userIdentificationCode\":\"CODE_ALREADY_USED\"}");
  });

  it('should return BAD_CODE validation error when attempting to add an identification code, but code does not exist', async () => {
    const response = await graphql(
      UpdateUserMutation,
      {
        input: {
          ...input,
          userIdentificationCode: 'ABCDEF',
        },
      },
      'internal_admin',
    );
    expect(response.updateUser.validationErrors).toBe("{\"userIdentificationCode\":\"BAD_CODE\"}");
  });

  it('should return MAX_LENGTH_EXCEEDED validation error when attempting to update biography with length over 246 chars', async () => {
    const response = await graphql(
      UpdateUserMutation,
      {
        input: {
          ...input,
          biography: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretz'
        },
      },
      'internal_admin',
    );
    expect(response.updateUser.validationErrors).toBe("{\"biography\":\"MAX_LENGTH_EXCEEDED\"}");
  });

  it('should return EMAIL_ALREADY_USED validation error when attempting to update an email used by another user', async () => {
    const response = await graphql(
      UpdateUserMutation,
      {
        input: {
          ...input,
          email: 'sfavot@cap-collectif.com'
        },
      },
      'internal_admin',
    );
    expect(response.updateUser.validationErrors).toBe("{\"email\":\"EMAIL_ALREADY_USED\"}");
  });
})
