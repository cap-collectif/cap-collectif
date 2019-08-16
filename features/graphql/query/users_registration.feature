@users_registration
Feature: Register user

@read-only
Scenario: User wants to check the complexity of his good password
  Given I send a GraphQL POST request:
  """
  {
    "query": "query passwordComplexityTest($username: String, $password: String!, $email: String!){
      passwordComplexityScore(
        username: $username,
        password: $password,
        email: $email)
    }",
    "variables": {
      "username": "kjgkbng",
      "password": "Beiebiuhf67&!",
      "email": "jean.paul.bella@hotmail.fr"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "passwordComplexityScore": 4
    }
  }
  """

@read-only
Scenario: User wants to check the complexity of his bad password
  Given I send a GraphQL POST request:
  """
  {
    "query": "query passwordComplexityTest($password: String!, $email: String!){
      passwordComplexityScore(
        password: $password,
        email: $email)
    }",
    "variables": {
      "password": "azertyuiop",
      "email": "jean.paul.bella@hotmail.fr"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "passwordComplexityScore": 0
    }
  }
  """
