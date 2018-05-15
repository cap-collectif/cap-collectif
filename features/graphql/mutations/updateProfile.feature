@user
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
          "id": "user5",
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
        viewer {
          id
          firstname
          lastname
          gender
          dateOfBirth
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
        "viewer": {
          "id": "user5",
          "firstname": "New firstname",
          "lastname": "new lastname",
          "gender": "OTHER",
          "dateOfBirth": "1992-12-12T00:00:00+01:00",
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

@database
Scenario: User should be able to update his public data
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePublicDataMutation($input: UpdateProfilePublicDataInput!) {
      updateProfilePublicData(input: $input) {
        viewer {
          id
          username
          website
          biography
        }
      }
    }",
    "variables": {
      "input": {
        "username": "New username",
        "website": "http://perdu.com",
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
        "viewer": {
          "id": "user5",
          "username": "New username",
          "website": "http://perdu.com",
          "biography": null
        }
      }
    }
  }
  """

@database
Scenario: User should be able to update his public data, but username is missing
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePublicDataMutation($input: UpdateProfilePublicDataInput!) {
      updateProfilePublicData(input: $input) {
        viewer {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "username": null
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors":[{"message":"Variable \u0022$input\u0022 got invalid value {\u0022username\u0022:null}.\nIn field \u0022username\u0022: Expected \u0022String!\u0022, found null.","locations":[{"line":1,"column":42}]}]
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
        viewer {
          id
          username
        }
      }
    }",
    "variables": {
      "input": {
        "current_password": "user",
        "new": "azerty1234"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProfilePassword": {
        "viewer": {
          "id": "user5",
          "username": "user"
        }
      }
    }
  }
  """

@database 
Scenario: User should be able to update his password, but give a bad current password
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation UpdateProfilePasswordMutation($input: UpdateProfilePasswordInput!) {
      updateProfilePassword(input: $input) {
        viewer {
          id
          username
        }
      }
    }",
    "variables": {
      "input": {
        "current_password": "userqsdqsdqsd",
        "new": "azerty1234"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
  "errors":[{"message":"Internal server Error","locations":[{"line":1,"column":82}],"path":["updateProfilePassword"]}],"data":{"updateProfilePassword":null}
  }
  """