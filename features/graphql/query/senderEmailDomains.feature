@emails @admin
Feature: SenderEmailDomain

Background:
  Given feature "emailing" is enabled

Scenario: GraphQL admin wants to get all senderEmailDomains
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      senderEmailDomains {
        value
        service
        spfValidation
        dkimValidation
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "senderEmailDomains":[
        {
          "value": "cap-collectif.com",
          "service": "MAILJET",
          "spfValidation": false,
          "dkimValidation": false
        },
        {
          "value": "cap-collectif.com",
          "service": "MANDRILL",
          "spfValidation": false,
          "dkimValidation": false
        },
        {
          "value": "elysee.gouv",
          "service": "MAILJET",
          "spfValidation": false,
          "dkimValidation": false
        }
      ]
    }
  }
  """

Scenario: GraphQL project owner wants to get all senderEmails and get only default one
  Given I am logged in to graphql as theo
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
        }
      ]
    }
  }
  """