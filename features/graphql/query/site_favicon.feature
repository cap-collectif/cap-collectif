@site_favicon
Feature: Site Favicon

Scenario: GraphQL client wants to get the current favicon
  Given I send a GraphQL POST request:
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
