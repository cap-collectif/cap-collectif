@updateContactPage
Feature: Update contact page informations

@database
Scenario: Admin wants to update contact page informations
  Given I am logged in to graphql as admin
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
  {
    "data": {
      "updateContactPage": {
          "title": "Je suis le nouveau titre",
          "description": "<p>Je suis la nouvelle description</p>"
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
