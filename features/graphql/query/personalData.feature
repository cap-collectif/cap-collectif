@personal_data
Feature: Personal Data RGPD

Scenario: GraphQL client want to get the personal data of authenticate user
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
        gender
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
        "dateOfBirth": "1996-03-01 00:00:00",
        "address": "12 rue des boulets",
        "address2": "2ieme etages",
        "zipCode": "75012",
        "city": "Paris",
        "phone": "+33635492871",
        "gender": "FEMALE"
      }
    }
  }
  """

Scenario: Anonymous GraphQL client want to get the personal data of a user
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
        "phone": null
      }
    },
    "extensions": {
      "warnings": [
        {
          "message": "Access denied to this field.",
          "category": @string@,
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

Scenario: Admin GraphQL client want to get the personal data of a user
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
        "dateOfBirth": "1996-03-01 00:00:00",
        "address": "12 rue des boulets",
        "address2": "2ieme etages",
        "zipCode": "75012",
        "city": "Paris",
        "phone": "+33635492871"
      }
    }
  }
  """

@security
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
        "phone": null
      }
    },
    "extensions": {
      "warnings": [
        {
          "message": "Access denied to this field.",
          "category": @string@,
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
