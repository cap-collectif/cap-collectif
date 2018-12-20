@map_token
Feature: Map Tokens

Scenario: GraphQL client wants to get list of available map tokens
  Given I send a GraphQL request:
  """
  {
    mapTokens {
      _id
      provider
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "mapTokens": [
        {
          "_id": "mapboxToken",
          "provider": "MAPBOX"
        },
        @...@
      ]
    }
  }
  """

Scenario: GraphQL client wants to get a particular map token given its provider
  Given I send a GraphQL request:
  """
  {
    mapToken (provider: MAPBOX) {
      _id
      publicToken
      secretToken
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "mapToken": {
        "_id": "mapboxToken",
        "publicToken": @string@,
        "secretToken": @string@
      }
    }
  }
  """

Scenario: GraphQL client wants to list styles for a particular map token given its provider
  Given I send a GraphQL request:
  """
  {
    mapToken (provider: MAPBOX) {
      _id
      styles {
        id
        name
        previewUrl
        owner
        visibility
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "mapToken": {
        "_id": "mapboxToken",
        "styles": [
          {
            "id": @string@,
            "name": @string@,
            "previewUrl": @string@,
            "owner": @string@,
            "visibility": @string@
          },
          @...@
        ]
      }
    }
  }
  """

Scenario: GraphQL client wants to list public styles for a particular map token given its provider
  Given I send a GraphQL request:
  """
  {
    mapToken (provider: MAPBOX) {
      _id
      styles(visibility: PUBLIC) {
        id
        name
        previewUrl
        owner
        visibility
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "mapToken": {
        "_id": "mapboxToken",
        "styles": [
          {
            "id": @string@,
            "name": @string@,
            "previewUrl": @string@,
            "owner": @string@,
            "visibility": "PUBLIC"
          },
          @...@
        ]
      }
    }
  }
  """

Scenario: GraphQL client wants to list private styles for a particular map token given its provider
  Given I send a GraphQL request:
  """
  {
    mapToken (provider: MAPBOX) {
      _id
      styles(visibility: PRIVATE) {
        id
        name
        previewUrl
        owner
        visibility
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "mapToken": {
        "_id": "mapboxToken",
        "styles": [
          {
            "id": @string@,
            "name": @string@,
            "previewUrl": @string@,
            "owner": @string@,
            "visibility": "PRIVATE"
          },
          @...@
        ]
      }
    }
  }
  """
