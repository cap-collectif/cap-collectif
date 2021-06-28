@emails @admin
Feature: SenderEmailDomain

Background:
  Given feature "unstable__emailing" is enabled

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
        }
      ]
    }
  }
  """
