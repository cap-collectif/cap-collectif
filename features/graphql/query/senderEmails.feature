@emails @admin
Feature: SenderEmail

Background:
  Given feature "beta__emailing" is enabled

Scenario: GraphQL admin wants to get all senderEmails
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      senderEmails {
        locale
        domain
        address
        isDefault
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "senderEmails":[
        {
          "locale": "assistance",
          "domain": "cap-collectif.com",
          "address": "assistance@cap-collectif.com",
          "isDefault": true
        },
        {
          "locale": "dev",
          "domain": "cap-collectif.com",
          "address": "dev@cap-collectif.com",
          "isDefault": false
        }
      ]
    }
  }
  """
