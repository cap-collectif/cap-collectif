@emails @admin
Feature: SenderEmail mutations

Background:
  Given feature "emailing" is enabled

Scenario: Admin tries to add a SenderEmail without adding domain first
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateSenderEmailInput!) {
      createSenderEmail(input: $input) {
        senderEmail {
          locale
          domain
        }
        errorCode
      }
    }",
    "variables": {
      "input": {
        "locale": "dev",
        "domain": "cap-individuel.com"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createSenderEmail": {
        "senderEmail": null,
        "errorCode": "INVALID_DOMAIN"
      }
    }
  }
  """

Scenario: Admin tries to add an already existing SenderEmail
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateSenderEmailInput!) {
      createSenderEmail(input: $input) {
        senderEmail {
          locale
          domain
        }
        errorCode
      }
    }",
    "variables": {
      "input": {
        "locale": "dev",
        "domain": "cap-collectif.com"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createSenderEmail": {
        "senderEmail": null,
        "errorCode": "ALREADY_EXIST"
      }
    }
  }
  """

@database
Scenario: Admin adds a new SenderEmail
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateSenderEmailInput!) {
      createSenderEmail(input: $input) {
        senderEmail {
          locale
          domain
          address
          isDefault
        }
      }
    }",
    "variables": {
      "input": {
        "locale": "juan",
        "domain": "cap-collectif.com"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createSenderEmail": {
        "senderEmail": {
          "locale": "juan",
          "domain": "cap-collectif.com",
          "address": "juan@cap-collectif.com",
          "isDefault": false
        }
      }
    }
  }
  """

Scenario: Admin tries to select a non existing SenderEmail
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: SelectSenderEmailInput!) {
      selectSenderEmail(input: $input) {
        senderEmail {
          isDefault
        }
        errorCode
      }
    }",
    "variables": {
      "input": {
        "senderEmail": "l_existence_est_en_tant_que_telle_decision_d_existence"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "selectSenderEmail": {
        "senderEmail": null,
        "errorCode": "UNKNOWN_SENDER_EMAIL"
      }
    }
  }
  """

@database
Scenario: Admin select a SenderEmail
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: SelectSenderEmailInput!) {
      selectSenderEmail(input: $input) {
        senderEmail {
          isDefault
        }
        errorCode
      }
    }",
    "variables": {
      "input": {
        "senderEmail": "U2VuZGVyRW1haWw6ZGV2LWNhcGNv"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "selectSenderEmail": {
        "senderEmail": {
          "isDefault": true
        },
        "errorCode": null
      }
    }
  }
  """
