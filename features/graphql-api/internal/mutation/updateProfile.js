import '../../_setup';

const UpdateProfilePasswordMutation = /* GraphQL */ `
  mutation UpdateProfilePasswordMutation(
    $input: UpdateProfilePasswordInput!
  ) {
    updateProfilePassword(input: $input) {
      user {
        id
        username
      }
      error
    }
  }`;

const UpdateProfilePersonalDataMutation = /* GraphQL */ `
  mutation UpdateProfilePersonalDataMutation(
    $input: UpdateProfilePersonalDataInput!
  ) {
    updateProfilePersonalData(input: $input) {
      user {
        id
        firstname
        lastname
        gender
        dateOfBirth
        postalAddress {
          json
        }
        address
        address2
        city
        zipCode
        phone
      }
    }
  }`;

const UpdateProfilePersonalDataIdCodeMutation = /* GraphQL */ `
  mutation UpdateProfilePersonalDataMutation(
    $input: UpdateProfilePersonalDataInput!
  ) {
    updateProfilePersonalData(input: $input) {
      user {
        id
      }
      errorCode
    }
  }`;

const UpdateProfilePublicDataMutation = /* GraphQL */ `
  mutation UpdateProfilePublicDataMutation(
    $input: UpdateProfilePublicDataInput!
  ) {
    updateProfilePublicData(input: $input) {
      user {
        id
        username
        websiteUrl
        biography
      }
    }
  }`;

const UpdateProfilePublicDataUsernameMutation = /* GraphQL */ `
  mutation UpdateProfilePublicDataMutation(
    $input: UpdateProfilePublicDataInput!
  ) {
    updateProfilePublicData(input: $input) {
      user {
        id
        username
      }
    }
  }`;

const UpdateUserAccountMutation = /* GraphQL */ `
  mutation UpdateUserAccountMutation(
    $input: UpdateUserAccountInput!
  ) {
    updateUserAccount(input: $input){
      user {
        id
        vip
        enabled
        roles
      }
    }
  }`;

const UpdateUsernameMutation = /* GraphQL */ `
  mutation UpdateUsernameMutation(
    $input: UpdateUsernameInput!
  ) {
    updateUsername(input: $input) {
      viewer {
        id
        username
      }
    }
  }`;


const inputPersonalData = {
  "firstname": "New firstname",
  "lastname": "new lastname",
  "gender": "OTHER",
  "dateOfBirth": "1992-12-12",
  "postalAddress": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
  "address": "noway",
  "address2":	null,
  "city": "Paris",
  "zipCode": "75012",
  "phone": null
}

const inputOtherUserDataAsSuperAdmin = {
  "userId": "VXNlcjp1c2VyTWF4aW1l",
  "firstname": "New firstname",
  "lastname": "new lastname",
  "gender": "OTHER",
  "postalAddress": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
  "dateOfBirth": "1992-12-12",
  "address": "noway",
  "address2":	null,
  "city": "Paris",
  "zipCode": "75012",
  "phone": null
}

const inputOtherUserDataAsUser = {
  "userId": "VXNlcjp1c2VyTWF4aW1l",
  "firstname": "New firstname",
  "lastname": "new lastname",
  "gender": "OTHER",
  "dateOfBirth": "1992-12-12",
  "postalAddress": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
  "address": "noway",
  "address2":	null,
  "city": "Paris",
  "zipCode": "75012",
  "phone": null
}

const inputUserIdCode = {
  "userIdentificationCode": "GG2AZR54"
}

const inputUserIdCodeUsed = {
  "userIdentificationCode": "DK2AZ554"
}

const inputUserIdCodeWrong = {
  "userIdentificationCode": "WrongC0de"
}

const inputGoodPassword = {
  "current_password": "user",
  "new_password": "Azerty1234"
}

const inputBadPassword = {
  "current_password": "userqsdqsdqsd",
  "new_password": "Azerty1234"
}

const inputPublicData = {
  "username": "New username",
  "websiteUrl": "http://perdu.com",
  "biography": null
}

const inputOtherUserPublicData = {
  "userId": "VXNlcjp1c2VyTWF4aW1l",
  "username": "New username",
  "websiteUrl": "http://perdu.com",
  "biography": null
}

const inputPublicDataUsername = {
  "username": "<h1><a href=x></a>pwned</h1>"
}

const inputUsername = {
  "username": "Nouveau username"
}

const inputOtherUserAccountAsSuperAdmin = {
  "userId": "VXNlcjp1c2VyTWF4aW1l",
  "vip": true,
  "enabled": true,
  "roles": ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPER_ADMIN"]
}
const inputOtherUserAccountAsAdmin = {
  "userId": "VXNlcjp1c2VyTWF4aW1l",
  "vip": true,
  "enabled": true,
  "roles": ["ROLE_ADMIN", "ROLE_USER"]
}
const inputOtherUserAccountAsAdminToSuperAdmin = {
  "userId": "VXNlcjp1c2VyQWRtaW4=",
  "vip": true,
  "enabled": true,
  "roles": ["ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_USER"]
}

describe('mutations.updateUsernameMutation', () => {
  it('should update update user username', async () => {
    await expect(
      graphql(
        UpdateUsernameMutation,
        { input: inputUsername },
        'internal_user',
      )
    ).resolves.toMatchSnapshot();
  });
})

describe('mutations.updateUserAccountMutation', () => {
  it('should update other user account as super admin', async () => {
    await expect(
      graphql(
        UpdateUserAccountMutation,
        { input: inputOtherUserAccountAsSuperAdmin },
        'internal_super_admin',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should update other user account as admin', async () => {
    await expect(
      graphql(
        UpdateUserAccountMutation,
        { input: inputOtherUserAccountAsAdmin },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should not update other/own user as admin to super admin', async () => {
    await expect(
      graphql(
        UpdateUserAccountMutation,
        { input: inputOtherUserAccountAsAdminToSuperAdmin },
        'internal_admin',
      )
    ).rejects.toThrowError('You are not able to add super_admin role to a user.');
  });
})

describe('mutations.updateProfilePersonalDataMutation', () => {
  it('should update user personal data', async () => {
    await expect(
      graphql(
        UpdateProfilePersonalDataMutation,
        { input: inputPersonalData },
        'internal_user',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should update personal data of an other user as super admin', async () => {
    await expect(
      graphql(
        UpdateProfilePersonalDataMutation,
        { input: inputOtherUserDataAsSuperAdmin },
        'internal_super_admin',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should not update personal data of an other user as user', async () => {
    await expect(
      graphql(
        UpdateProfilePersonalDataMutation,
        { input: inputOtherUserDataAsUser },
        'internal_user',
      )
    ).rejects.toThrowError("Only a SUPER_ADMIN can edit data from another user. ");
  });
  it('should add identification code, and code is ok', async () => {
    await expect(
      graphql(
        UpdateProfilePersonalDataIdCodeMutation,
        { input: inputUserIdCode },
        'internal_kiroule',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should add identification code, but code is already used', async () => {
    await expect(
      graphql(
        UpdateProfilePersonalDataIdCodeMutation,
        { input: inputUserIdCodeUsed },
        'internal_kiroule',
      )
    ).rejects.toThrowError('An unknown error occurred.');
  });
  it('should add identification code, but the code is wrong', async () => {
    await expect(
      graphql(
        UpdateProfilePersonalDataIdCodeMutation,
        { input: inputUserIdCodeWrong },
        'internal_kiroule',
      )
    ).resolves.toMatchSnapshot();
  });
})

describe('mutations.updateProfilePublicDataMutation', () => {
  it('should update user public data', async () => {
    await expect(
      graphql(
        UpdateProfilePublicDataMutation,
        { input: inputPublicData },
        'internal_user',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should update public data of an other user as super admin', async () => {
    await expect(
      graphql(
        UpdateProfilePublicDataMutation,
        { input: inputOtherUserPublicData },
        'internal_super_admin',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should not update public data of an other user as user', async () => {
    await expect(
      graphql(
        UpdateProfilePublicDataMutation,
        { input: inputOtherUserPublicData },
        'internal_user',
      )
    ).rejects.toThrowError("Only a SUPER_ADMIN can edit data from another user.");
  });
  it('should inject HTML into username', async () => {
    await expect(
      graphql(
        UpdateProfilePublicDataUsernameMutation,
        { input: inputPublicDataUsername },
        'internal_user',
      )
    ).resolves.toMatchSnapshot();
  });
})

describe('mutations.updateProfilePasswordMutation', () => {
  it('should update user password if current password is wrong', async () => {
    await expect(
      graphql(
        UpdateProfilePasswordMutation,
        { input: inputBadPassword },
        'internal_user',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should update user password', async () => {
    await expect(
      graphql(
        UpdateProfilePasswordMutation,
        { input: inputGoodPassword },
        'internal_user',
      )
    ).resolves.toMatchSnapshot();
  });
})