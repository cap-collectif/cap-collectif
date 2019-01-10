@addSource
Feature: Add Source

@database
Scenario: User wants to add a source on an opinion
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddSourceInput!) {
      addSource(input: $input) {
        source {
          id
          published
          body
          title
          link
          category {
            id
          }
          author {
            _id
          }
        }
        sourceEdge {
          cursor
          node {
            id
          }
        }
        userErrors {
          message
        }
      }
    }",
    "variables": {
      "input": {
        "sourceableId": "opinion1",
        "link": "http://google.com",
        "title": "Je suis une source",
        "body": "<div>Jai un corps mais pas de bras :'(</div>",
        "category": "category2"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addSource": {
        "userErrors": [],
        "source": {
          "id": @string@,
          "published": true,
          "link": "http://google.com",
          "title": "Je suis une source",
          "category": {
            "id": "category2"
          },
          "body": "\u003Cdiv\u003EJai un corps mais pas de bras :\u0027(\u003C\/div\u003E",
          "author": {
            "_id": "user5"
          }
        },
        "sourceEdge": {
          "cursor": @string@,
          "node": {
            "id": @string@
          }
        }
      }
    }
  }
  """

@security
Scenario: User wants to add a source on an uncontributable
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddSourceInput!) {
      addSource(input: $input) {
        source {
          id
        }
        userErrors {
          message
        }
      }
    }",
    "variables": {
      "input": {
        "sourceableId": "opinion63",
        "link": "http://google.com",
        "title": "Je suis une source",
        "body": "<div>Jai un corps mais pas de bras :'(</div>",
        "category": "category2"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addSource": {
        "userErrors":[{"message":"Can't add an source to an uncontributable sourceable."}],
        "source": null
      }
    }
  }
  """

@security
Scenario: User wants to add a source without meeting all requirements
  Given I am logged in to graphql as jean
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddSourceInput!) {
      addSource(input: $input) {
        source {
          id
        }
        userErrors {
          message
        }
      }
    }",
    "variables": {
      "input": {
        "sourceableId": "opinion1",
        "link": "http://google.com",
        "title": "Je suis une source",
        "body": "<div>Jai un corps mais pas de bras :'(</div>",
        "category": "category2"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addSource": {
        "userErrors":[{"message":"You dont meets all the requirements."}],
        "source": null
      }
    }
  }
  """
