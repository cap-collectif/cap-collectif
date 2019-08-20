@change_site_favicon
Feature: Change site favicon

@database
Scenario: GraphQL admin client wants to update the current favicon
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      siteFavicon {
        id
        keyname
        media {
          id
          url
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {"data":{"siteFavicon":{"id":@string@,"keyname":"favicon","media":null}}}
  """
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

@database
Scenario: GraphQL client who is not an admin wants to update the current favicon
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      siteFavicon {
        id
        keyname
        media {
          id
          url
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {"data":{"siteFavicon":{"id":@string@,"keyname":"favicon","media":null}}}
  """
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
  {"errors":[{"message":"Access denied to this field.","@*@": "@*@"}],"data":{"changeSiteFavicon":null}}
  """
