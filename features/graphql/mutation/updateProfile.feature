@user @user_graphql
Feature: Update a user

@database
Scenario: User should be able to update his username
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProfileInput!) {
      updateProfile(input: $input) {
        viewer {
          id
          username
        }
      }
    }",
    "variables": {
      "input": {
        "username": "Nouveau username"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProfile": {
        "viewer": {
          "id": "VXNlcjp1c2VyNQ==",
          "username": "Nouveau username"
        }
      }
    }
  }
  """

@database
Scenario: User should be able to update his personal data
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePersonalDataMutation($input: UpdateProfilePersonalDataInput!) {
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
    }",
    "variables": {
      "input": {
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
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProfilePersonalData": {
        "user": {
          "id": "VXNlcjp1c2VyNQ==",
          "firstname": "New firstname",
          "lastname": "new lastname",
          "gender": "OTHER",
          "dateOfBirth": "1992-12-12 00:00:00",
          "postalAddress": {
            "json": "[{\u0022address_components\u0022:[{\u0022long_name\u0022:\u0022262\u0022,\u0022short_name\u0022:\u0022262\u0022,\u0022types\u0022:[\u0022street_number\u0022]},{\u0022long_name\u0022:\u0022Avenue G\u00e9n\u00e9ral Leclerc\u0022,\u0022short_name\u0022:\u0022Avenue G\u00e9n\u00e9ral Leclerc\u0022,\u0022types\u0022:[\u0022route\u0022]},{\u0022long_name\u0022:\u0022Rennes\u0022,\u0022short_name\u0022:\u0022Rennes\u0022,\u0022types\u0022:[\u0022locality\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022Ille-et-Vilaine\u0022,\u0022short_name\u0022:\u0022Ille-et-Vilaine\u0022,\u0022types\u0022:[\u0022administrative_area_level_2\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022Bretagne\u0022,\u0022short_name\u0022:\u0022Bretagne\u0022,\u0022types\u0022:[\u0022administrative_area_level_1\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022France\u0022,\u0022short_name\u0022:\u0022FR\u0022,\u0022types\u0022:[\u0022country\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u002235700\u0022,\u0022short_name\u0022:\u002235700\u0022,\u0022types\u0022:[\u0022postal_code\u0022]}],\u0022formatted_address\u0022:\u0022262 Avenue G\u00e9n\u00e9ral Leclerc, 35700 Rennes, France\u0022,\u0022geometry\u0022:{\u0022bounds\u0022:{\u0022northeast\u0022:{\u0022lat\u0022:48.1140978,\u0022lng\u0022:-1.6404985},\u0022southwest\u0022:{\u0022lat\u0022:48.1140852,\u0022lng\u0022:-1.640499}},\u0022location\u0022:{\u0022lat\u0022:48.1140852,\u0022lng\u0022:-1.6404985},\u0022location_type\u0022:\u0022RANGE_INTERPOLATED\u0022,\u0022viewport\u0022:{\u0022northeast\u0022:{\u0022lat\u0022:48.1154404802915,\u0022lng\u0022:-1.639149769708498},\u0022southwest\u0022:{\u0022lat\u0022:48.1127425197085,\u0022lng\u0022:-1.641847730291502}}},\u0022place_id\u0022:\u0022EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\u0022,\u0022types\u0022:[\u0022street_address\u0022]}]"
          },
          "address": "noway",
          "address2": null,
          "city": "Paris",
          "zipCode": "75012",
          "phone": null
        }
      }
    }
  }
  """

@database
Scenario: A super admin wants to update personal data of an other user
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePersonalDataMutation($input: UpdateProfilePersonalDataInput!) {
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
    }",
    "variables": {
      "input": {
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
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProfilePersonalData": {
        "user": {
          "id": "VXNlcjp1c2VyTWF4aW1l",
          "firstname": "New firstname",
          "lastname": "new lastname",
          "gender": "OTHER",
          "dateOfBirth": "1992-12-12 00:00:00",
          "postalAddress": {
            "json": "[{\u0022address_components\u0022:[{\u0022long_name\u0022:\u0022262\u0022,\u0022short_name\u0022:\u0022262\u0022,\u0022types\u0022:[\u0022street_number\u0022]},{\u0022long_name\u0022:\u0022Avenue G\u00e9n\u00e9ral Leclerc\u0022,\u0022short_name\u0022:\u0022Avenue G\u00e9n\u00e9ral Leclerc\u0022,\u0022types\u0022:[\u0022route\u0022]},{\u0022long_name\u0022:\u0022Rennes\u0022,\u0022short_name\u0022:\u0022Rennes\u0022,\u0022types\u0022:[\u0022locality\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022Ille-et-Vilaine\u0022,\u0022short_name\u0022:\u0022Ille-et-Vilaine\u0022,\u0022types\u0022:[\u0022administrative_area_level_2\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022Bretagne\u0022,\u0022short_name\u0022:\u0022Bretagne\u0022,\u0022types\u0022:[\u0022administrative_area_level_1\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022France\u0022,\u0022short_name\u0022:\u0022FR\u0022,\u0022types\u0022:[\u0022country\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u002235700\u0022,\u0022short_name\u0022:\u002235700\u0022,\u0022types\u0022:[\u0022postal_code\u0022]}],\u0022formatted_address\u0022:\u0022262 Avenue G\u00e9n\u00e9ral Leclerc, 35700 Rennes, France\u0022,\u0022geometry\u0022:{\u0022bounds\u0022:{\u0022northeast\u0022:{\u0022lat\u0022:48.1140978,\u0022lng\u0022:-1.6404985},\u0022southwest\u0022:{\u0022lat\u0022:48.1140852,\u0022lng\u0022:-1.640499}},\u0022location\u0022:{\u0022lat\u0022:48.1140852,\u0022lng\u0022:-1.6404985},\u0022location_type\u0022:\u0022RANGE_INTERPOLATED\u0022,\u0022viewport\u0022:{\u0022northeast\u0022:{\u0022lat\u0022:48.1154404802915,\u0022lng\u0022:-1.639149769708498},\u0022southwest\u0022:{\u0022lat\u0022:48.1127425197085,\u0022lng\u0022:-1.641847730291502}}},\u0022place_id\u0022:\u0022EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\u0022,\u0022types\u0022:[\u0022street_address\u0022]}]"
          },
          "address":"noway",
          "address2": null,
          "city": "Paris",
          "zipCode": "75012",
          "phone": null
        }
      }
    }
  }
  """

@security
Scenario: User should not be able to update personal data of an other user
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePersonalDataMutation($input: UpdateProfilePersonalDataInput!) {
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
    }",
    "variables": {
      "input": {
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
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors":[{"message":"Only a SUPER_ADMIN can edit data from another user. Or the account owner","@*@": "@*@"}],"data":{"updateProfilePersonalData":null}
  }
  """

@database
Scenario: User should be able to update his public data
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePublicDataMutation($input: UpdateProfilePublicDataInput!) {
      updateProfilePublicData(input: $input) {
        user {
          id
          username
          websiteUrl
          biography
        }
      }
    }",
    "variables": {
      "input": {
        "username": "New username",
        "websiteUrl": "http://perdu.com",
        "biography": null
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProfilePublicData": {
        "user": {
          "id": "VXNlcjp1c2VyNQ==",
          "username": "New username",
          "websiteUrl": "http://perdu.com",
          "biography": null
        }
      }
    }
  }
  """

@database
Scenario: Super Admin should be able to update public data of an other user
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePublicDataMutation($input: UpdateProfilePublicDataInput!) {
      updateProfilePublicData(input: $input) {
        user {
          id
          username
          websiteUrl
          biography
        }
      }
    }",
    "variables": {
      "input": {
        "userId": "VXNlcjp1c2VyTWF4aW1l",
        "username": "New username",
        "websiteUrl": "http://perdu.com",
        "biography": null
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProfilePublicData": {
        "user": {
          "id": "VXNlcjp1c2VyTWF4aW1l",
          "username": "New username",
          "websiteUrl": "http://perdu.com",
          "biography": null
        }
      }
    }
  }
  """

@security
Scenario: User should not be able to update personal data of an other user
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePublicDataMutation($input: UpdateProfilePublicDataInput!) {
      updateProfilePublicData(input: $input) {
        user {
          id
          username
          websiteUrl
          biography
        }
      }
    }",
    "variables": {
      "input": {
        "userId": "VXNlcjp1c2VyTWF4aW1l",
        "username": "New username",
        "websiteUrl": "http://perdu.com",
        "biography": null
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors":[{"message":"Only a SUPER_ADMIN can edit data from another user. Or the account owner","@*@": "@*@"}],"data":{"updateProfilePublicData":null}
  }
  """

@database
Scenario: User should be able to update his password
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePasswordMutation($input: UpdateProfilePasswordInput!) {
      updateProfilePassword(input: $input) {
        user {
          id
          username
        }
        error
      }
    }",
    "variables": {
      "input": {
        "current_password": "user",
        "new_password": "Azerty1234"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProfilePassword": {
        "user": {
          "id": "VXNlcjp1c2VyNQ==",
          "username": "user"
        },
        "error": null
      }
    }
  }
  """

@security
Scenario: User should be able to update his password, but give a bad current password
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePasswordMutation($input: UpdateProfilePasswordInput!) {
      updateProfilePassword(input: $input) {
        user {
          id
          username
        },
        error
      }
    }",
    "variables": {
      "input": {
        "current_password": "userqsdqsdqsd",
        "new_password": "Azerty1234"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "updateProfilePassword":{
        "user":{
          "id":"VXNlcjp1c2VyNQ==",
          "username":"user"
        },
        "error":"fos_user.password.not_current"
      }
    }
  }
  """

@database
Scenario: Super admin should be able to update other user account
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateUserAccountMutation($input: UpdateUserAccountInput!) {
      updateUserAccount(input: $input) {
        user {
          id
          vip
          enabled
          roles
        }
      }
    }",
    "variables": {
      "input": {
        "userId": "VXNlcjp1c2VyTWF4aW1l",
        "vip": true,
        "enabled": true,
        "roles": ["ROLE_ADMIN", "ROLE_USER", "ROLE_SUPER_ADMIN"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "updateUserAccount":{
        "user":{
          "id":"VXNlcjp1c2VyTWF4aW1l",
          "vip":true,
          "enabled":true,
          "roles":["ROLE_SUPER_ADMIN","ROLE_ADMIN","ROLE_USER"]
        }
      }
    }
  }
  """

@database
Scenario: Admin should be able to update other user account
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateUserAccountMutation($input: UpdateUserAccountInput!) {
      updateUserAccount(input: $input) {
        user {
          id
          vip
          enabled
          roles
        }
      }
    }",
    "variables": {
      "input": {
        "userId": "VXNlcjp1c2VyTWF4aW1l",
        "vip": true,
        "enabled": true,
        "roles": ["ROLE_ADMIN", "ROLE_USER"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "updateUserAccount":{
        "user":{
          "id":"VXNlcjp1c2VyTWF4aW1l",
          "vip":true,
          "enabled":true,
          "roles":["ROLE_SUPER_ADMIN","ROLE_ADMIN","ROLE_USER"]
        }
      }
    }
  }
  """

@security
Scenario: Admin should not be able to update other/own user as super admin
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateUserAccountMutation($input: UpdateUserAccountInput!) {
      updateUserAccount(input: $input) {
        user {
          id
          vip
          enabled
          roles
        }
      }
    }",
    "variables": {
      "input": {
        "userId": "VXNlcjp1c2VyQWRtaW4=",
        "vip": true,
        "enabled": true,
        "roles": ["ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_USER"]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
"errors":[{"message":"You are not able to add super_admin role to a user.","@*@": "@*@"}],"data":{"updateUserAccount":null}
  }
  """

@database
Scenario: A hacker want to inject HTML into username
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePublicDataMutation($input: UpdateProfilePublicDataInput!) {
      updateProfilePublicData(input: $input) {
        user {
          id
          username
        }
      }
    }",
    "variables": {
      "input": {
        "username": "<h1><a href=x></a>pwned</h1>"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProfilePublicData": {
        "user": {
          "id": "VXNlcjp1c2VyNQ==",
          "username": "pwned"
        }
      }
    }
  }
  """

@database
Scenario: User should be able to add identification code, and code is ok
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePersonalDataMutation($input: UpdateProfilePersonalDataInput!) {
      updateProfilePersonalData(input: $input) {
        user {
          id
        }
        errorCode
      }
    }",
    "variables": {
      "input": {
        "userIdentificationCode": "GG2AZR54"
      }
    }
  }
  """
  Then the JSON response should match:
  """
    {
       "data":{
          "updateProfilePersonalData":{
             "user":{
                "id":"VXNlcjp1c2VyS2lyb3VsZQ=="
             },
             "errorCode":null
          }
       }
    }
  """

@database
Scenario: User should be able to add identification code, but code is already used
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePersonalDataMutation($input: UpdateProfilePersonalDataInput!) {
      updateProfilePersonalData(input: $input) {
        user {
          id
        }
        errorCode
      }
    }",
    "variables": {
      "input": {
        "userIdentificationCode": "DK2AZ554"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"An unknown error occurred.","extensions":{"category":"user"},"locations":[{"line":1,"column":90}],"path":["updateProfilePersonalData"]}],"data":{"updateProfilePersonalData":null}}
  """

@database
Scenario: User should be able to add identification code, but the code is wrong
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePersonalDataMutation($input: UpdateProfilePersonalDataInput!) {
      updateProfilePersonalData(input: $input) {
        user {
          id
        }
        errorCode
      }
    }",
    "variables": {
      "input": {
        "userIdentificationCode": "WrongC0de"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"updateProfilePersonalData":{"user":{"id":"VXNlcjp1c2VyS2lyb3VsZQ=="},"errorCode":"CANT_UPDATE"}}}
  """