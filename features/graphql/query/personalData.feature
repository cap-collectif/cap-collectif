@personal_data
Feature: Personal Data RGPD

Scenario: GraphQL client want to get the personal data of user authenticate as user
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
  "query": "query getPersonalData {
      viewer {
        firstname
        lastname
        dateOfBirth
        address
        address2
        zipCode
        city
        phone
        mobilePhone
      }
    }"
  }
  """
    Then the JSON response should match:
  """
  {
    "data": {
      "viewer": {
        "firstname": "Utilisateur",
        "lastname": "authentifier",
        "dateOfBirth": "1996-03-01T00:00:00+01:00",
        "address": "12 rue des boulets",
        "address2": "2ieme etages",
        "zipCode": "75012",
        "city": "Paris",
        "phone": "+33135492871",
        "mobilePhone": "+33613374269"
      }
    }
  }
  """

Scenario: GraphQL client want to get the personal data of user not authenticated (anonymous)
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($userId: ID!) {
      user: node(id: $userId) {
        ... on User {
            firstname
            lastname
            dateOfBirth
            address
            address2
            zipCode
            city
            phone
            mobilePhone
        }
      }
    }",
    "variables": {
      "userId": "user5"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "user": {
        "firstname": null,
        "lastname": null,
        "dateOfBirth": null,
        "address": null,
        "address2": null,
        "zipCode": null,
        "city": null,
        "phone": null,
        "mobilePhone": null
      }
    },
    "extensions": {
      "warnings": [
        {
          "message": "Access denied to this field.",
          "locations": [
            {
              "line": 1,
              "column": @integer@
            }
          ],
          "path": [
            "user",
            "@string@"
          ]
        },
        @...@
      ]
    }
  }
  """

Scenario: GraphQL client want to get the personal data of user authenticate as admin
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query node ($userId: ID!) {
      user: node(id: $userId) {
        ... on User {
            firstname
            lastname
            dateOfBirth
            address
            address2
            zipCode
            city
            phone
            mobilePhone
        }
      }
    }",
    "variables": {
      "userId": "user5"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "user": {
        "firstname": "Utilisateur",
        "lastname": "authentifier",
        "dateOfBirth": "1996-03-01T00:00:00+01:00",
        "address": "12 rue des boulets",
        "address2": "2ieme etages",
        "zipCode": "75012",
        "city": "Paris",
        "phone": "+33135492871",
        "mobilePhone": "+33613374269"
      }
    }
  }
  """

Scenario: GraphQL client want to get the personal data of user authenticated as pierre (other user)
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
  """
  {
    "query": "query node ($userId: ID!) {
      user: node(id: $userId) {
        ... on User {
            firstname
            lastname
            dateOfBirth
            address
            address2
            zipCode
            city
            phone
            mobilePhone
        }
      }
    }",
    "variables": {
      "userId": "user5"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "user": {
        "firstname": null,
        "lastname": null,
        "dateOfBirth": null,
        "address": null,
        "address2": null,
        "zipCode": null,
        "city": null,
        "phone": null,
        "mobilePhone": null
      }
    },
    "extensions": {
      "warnings": [
        {
          "message": "Access denied to this field.",
          "locations": [
            {
              "line": 1,
              "column": @integer@
            }
          ],
          "path": [
            "user",
            "@string@"
          ]
        },
        @...@
      ]
    }
  }
  """