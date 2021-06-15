Feature: externalServiceConfiguration

Scenario:  GraphQL admin wants to get mailer configuration
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      externalServiceConfiguration(type: MAILER) {
        type
        value
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "externalServiceConfiguration":{
        "type":"MAILER",
        "value":"mandrill"
      }
    }
  }
  """
