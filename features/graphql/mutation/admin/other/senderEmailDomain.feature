@emails @admin
Feature: SenderEmailDomain mutations

Background:
  Given feature "emailing" is enabled

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

Scenario: Admin tries ti delete an used SenderEmailDomain
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteSenderEmailDomainInput!) {
      deleteSenderEmailDomain(input: $input) {
        deletedId
        errorCode
      }
    }",
    "variables": {
      "input": {
        "id": "mailjetCapco"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteSenderEmailDomain": {
        "deletedId": null,
        "errorCode": "DOMAIN_USED"
      }
    }
  }
  """

@database
Scenario: Admin deletes a SenderEmailDomain
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteSenderEmailDomainInput!) {
      deleteSenderEmailDomain(input: $input) {
        deletedId
        errorCode
      }
    }",
    "variables": {
      "input": {
        "id": "mailjetElysee"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteSenderEmailDomain": {
        "deletedId": "mailjetElysee",
        "errorCode": null
      }
    }
  }
  """