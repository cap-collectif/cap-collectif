@toggles @other
Feature: Toggles

@database
Scenario: Anonymous GraphQL attempt to update a toggle
  Given I am logged out
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ToggleFeatureMutation($input: ToggleFeatureInput!) {
      toggleFeature(input: $input) {
        featureFlag {
          type
          enabled
        }
      }
    }",
    "variables": {
      "input": {
        "type": "login_facebook",
        "enabled": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {"message":"Access denied to this field.","@*@": "@*@"}
    ],
    "data": {
      "toggleFeature": null
    }
  }
  """

@database
Scenario: GraphQL client wants to update a non existing toggle
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ToggleFeatureMutation($input: ToggleFeatureInput!) {
      toggleFeature(input: $input) {
        featureFlag {
          type
          enabled
        }
      }
    }",
    "variables": {
      "input": {
        "type": "abc",
        "enabled": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Variable \u0022$input\u0022 got invalid value {\u0022type\u0022:\u0022abc\u0022,\u0022enabled\u0022:true}; Expected type FeatureFlagType at value.type.","extensions":{"category":"graphql"},"locations":[{"line":1,"column":32}]}]}
  """

@database
Scenario: GraphQL client wants to update a toggle
  Given I am logged in to graphql as admin
  And feature "login_facebook" is disabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ToggleFeatureMutation($input: ToggleFeatureInput!) {
      toggleFeature(input: $input) {
        featureFlag {
          type
          enabled
        }
      }
    }",
    "variables": {
      "input": {
        "type": "login_facebook",
        "enabled": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "toggleFeature": {
        "featureFlag": {
          "type": "login_facebook",
          "enabled": true
        }
      }
    }
  }
  """
  And feature "login_facebook" should be enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ToggleFeatureMutation($input: ToggleFeatureInput!) {
      toggleFeature(input: $input) {
        featureFlag {
          type
          enabled
        }
      }
    }",
    "variables": {
      "input": {
        "type": "login_facebook",
        "enabled": false
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "toggleFeature": {
        "featureFlag": {
          "type": "login_facebook",
          "enabled": false
        }
      }
    }
  }
  """
  And feature "login_facebook" should be disabled