@emails @admin
Feature: SenderEmailDomain mutations

Background:
  Given feature "unstable__emailing" is enabled

Scenario: Admin wants to add a new SenderEmailDomain but already exists
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateSenderEmailDomainInput!) {
      createSenderEmailDomain(input: $input) {
        errorCode
        senderEmailDomain {
          value
        }
      }
    }",
    "variables": {
      "input": {
        "service": "MANDRILL",
        "value": "cap-collectif.com"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createSenderEmailDomain": {
        "errorCode": "ALREADY_EXIST",
        "senderEmailDomain": null
      }
    }
  }
  """

@database
Scenario: Admin adds a new SenderEmailDomain
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateSenderEmailDomainInput!) {
      createSenderEmailDomain(input: $input) {
        senderEmailDomain {
          service
          value
          spfValidation
          dkimValidation
        }
      }
    }",
    "variables": {
      "input": {
        "service": "MANDRILL",
        "value": "cap-individuel.com"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createSenderEmailDomain": {
        "senderEmailDomain": {
          "service": "MANDRILL",
          "value": "cap-individuel.com",
          "spfValidation": false,
          "dkimValidation": false
        }
      }
    }
  }
  """
