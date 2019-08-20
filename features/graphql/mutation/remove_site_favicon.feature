@remove_site_favicon
Feature: Remove site favicon

@database
Scenario: GraphQL admin client wants to remove the current favicon
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: InternalChangeSiteFaviconInput!) {
      changeSiteFavicon(input: $input) {
        siteFavicon {
          id
          keyname
          media {
            id
            url
          }
        }
      }
    }",
    "variables": {
      "input": {
        "mediaId": "media12"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"changeSiteFavicon":{"siteFavicon":{"id":@string@,"keyname":"favicon","media":{"id":"media12","url":@string@}}}}}
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: InternalRemoveSiteFaviconInput!) {
      removeSiteFavicon(input: $input) {
        siteFavicon {
          id
          keyname
          media {
            id
            url
          }
        }
      }
    }",
    "variables": {
      "input": {}
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"removeSiteFavicon":{"siteFavicon":{"id":@string@,"keyname":"favicon","media":null}}}}
  """

@database
Scenario: GraphQL client who is not an admin wants to remove the current favicon
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: InternalRemoveSiteFaviconInput!) {
      removeSiteFavicon(input: $input) {
        siteFavicon {
          id
          keyname
          media {
            id
            url
          }
        }
      }
    }",
    "variables": {
      "input": {}
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"Access denied to this field.","@*@": "@*@"}],"data":{"removeSiteFavicon":null}}
  """
