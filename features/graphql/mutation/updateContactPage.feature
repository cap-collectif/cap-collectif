@updateContactPage @admin
Feature: Update contact page informations

@database @dev
Scenario: Admin wants to update contact page informations
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateContactPageInput!) {
      updateContactPage(input: $input) {
        title
        description
        customcode
      }
    }",
    "variables": {
      "input": {
        "title": "Je suis le nouveau titre",
        "description": "<p>Je suis la nouvelle description</p>",
        "customcode": null
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateContactPage": {
          "title": "Je suis le nouveau titre",
          "description": "<p>Je suis la nouvelle description</p>",
          "customcode": ""
       }
     }
  }
  """

@database
Scenario: Admin wants to create a new traduction of contact page informations in english
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateContactPageInput!) {
      updateContactPage(input: $input) {
        title
      }
    }",
    "variables": {
      "input": {
        "title": "I am the new title",
        "locale": "en-GB"
      }
    }
  }
  """
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateContactPageInput!) {
      updateContactPage(input: $input) {
        title
      }
    }",
    "variables": {
      "input": {
        "title": "I am the new new title",
        "locale": "en-GB"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateContactPage": {
          "title": "I am the new new title"
       }
     }
  }
  """

@database
Scenario: Admin wants to update contact page informations in english
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateContactPageInput!) {
      updateContactPage(input: $input) {
        title
      }
    }",
    "variables": {
      "input": {
        "title": "I am the new title",
        "locale": "en-GB"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateContactPage": {
          "title": "I am the new title"
       }
     }
  }
  """

@database
Scenario: Normal user wants to update contact page informations
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: UpdateContactPageInput!) {
      updateContactPage(input: $input) {
        title
        description
      }
    }",
    "variables": {
      "input": {
        "title": "Je suis le nouveau titre",
        "description": "<p>Je suis la nouvelle description</p>"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Access denied to this field.","@*@": "@*@"}],"data":{"updateContactPage":null}}
  """
