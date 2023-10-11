@createUserIdentificationCodeList @userIdentificationCode @other
Feature: createUserIdentificationCodeList

Scenario: API client wants to create a list but is not admin
  Given I am logged in to graphql as theo
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateUserIdentificationCodeListInput!) {
      createUserIdentificationCodeList(input: $input) {
        userIdentificationCodeList {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "name": "ben voyons",
        "data": [
          {
            "title": "m",
            "firstname": "théo",
            "lastname": "QP",
            "address1": "non",
            "zipCode": "00001",
            "city": "théoville",
            "country": "portougal"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {"message":"Access denied to this field.","@*@": "@*@"}
    ],
    "data": {
      "createUserIdentificationCodeList": null
    }
  }
  """

@database
Scenario: API admin creates a list
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateUserIdentificationCodeListInput!) {
      createUserIdentificationCodeList(input: $input) {
        userIdentificationCodeList {
          id
          name
          codesCount
          alreadyUsedCount
        }
      }
    }",
    "variables": {
      "input": {
        "name": "La team backend",
        "data": [
          {
            "title": "m",
            "firstname": "Théo",
            "lastname": "Bourgoin",
            "address1": "25 rue Claude Tillier",
            "zipCode": "75011",
            "city": "Paris",
            "country": "France"
          },
          {
            "title": "m",
            "firstname": "Alex",
            "lastname": "Tea",
            "address1": "25 rue Claude Tillier",
            "zipCode": "75011",
            "city": "Paris",
            "country": "France"
          },
          {
            "title": "m",
            "firstname": "Maxime",
            "lastname": "Auriau",
            "address1": "25 rue Claude Tillier",
            "zipCode": "75011",
            "city": "Paris",
            "country": "France"
          },
          {
            "title": "m",
            "firstname": "Mickaël",
            "lastname": "Buliard",
            "address1": "25 rue Claude Tillier",
            "zipCode": "75011",
            "city": "Paris",
            "country": "France"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createUserIdentificationCodeList": {
        "userIdentificationCodeList": {
          "id": "@*@",
          "name": "La team backend",
          "codesCount": 4,
          "alreadyUsedCount": 0
        }
      }
    }
  }
  """

@database
Scenario: API admin creates a list with 8 length code
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateUserIdentificationCodeListInput!) {
      createUserIdentificationCodeList(input: $input) {
        userIdentificationCodeList {
          id
          name
          codesCount
          alreadyUsedCount
        }
      }
    }",
    "variables": {
      "input": {
        "name": "La team backend",
        "data": [
          {
            "title": "m",
            "firstname": "Théo",
            "lastname": "Bourgoin",
            "address1": "25 rue Claude Tillier",
            "zipCode": "75011",
            "city": "Paris",
            "country": "France"
          },
          {
            "title": "m",
            "firstname": "Alex",
            "lastname": "Tea",
            "address1": "25 rue Claude Tillier",
            "zipCode": "75011",
            "city": "Paris",
            "country": "France"
          },
          {
            "title": "m",
            "firstname": "Maxime",
            "lastname": "Auriau",
            "address1": "25 rue Claude Tillier",
            "zipCode": "75011",
            "city": "Paris",
            "country": "France"
          },
          {
            "title": "m",
            "firstname": "Mickaël",
            "lastname": "Buliard",
            "address1": "25 rue Claude Tillier",
            "zipCode": "75011",
            "city": "Paris",
            "country": "France"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createUserIdentificationCodeList": {
        "userIdentificationCodeList": {
          "id": "@*@",
          "name": "La team backend",
          "codesCount": 4,
          "alreadyUsedCount": 0
        }
      }
    }
  }
  """