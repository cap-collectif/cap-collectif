@addComment
Feature: Add Comment

@database
Scenario: User wants to add a comment on a proposal
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddCommentInput!) {
      addComment(input: $input) {
        commentEdge {
          node {
            id
            published
            body
            author {
              _id
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "commentableId": "UHJvcG9zYWw6cHJvcG9zYWwx",
        "body": "Tololo"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addComment": {
          "commentEdge": {
              "node": {
                  "id": @uuid@,
                  "published": true,
                  "body": "Tololo",
                  "author": {
                    "_id": "user5"
                  }
              }
          }
       }
     }
  }
  """

@database
Scenario: Anonymous wants to add a comment on a blog post
  Given I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddCommentInput!) {
      addComment(input: $input) {
        commentEdge {
          node {
            id
            published
            body
            author {
              id
            }
            authorName
            authorEmail
          }
        }
      }
    }",
    "variables": {
      "input": {
        "commentableId": "UHJvcG9zYWw6cHJvcG9zYWwx",
        "body": "Je suis un super contenu",
        "authorName": "Je suis anonyme",
        "authorEmail": "anonyme@cap-collectif.com"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addComment": {
          "commentEdge": {
              "node": {
                  "id": @uuid@,
                  "published": true,
                  "body": "Je suis un super contenu",
                  "author": null,
                  "authorName": "Je suis anonyme",
                  "authorEmail": "anonyme@cap-collectif.com"
              }
          }
       }
     }
  }
  """

@database
Scenario: Anonymous wants to add an anwer to a comment
  Given I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddCommentInput!) {
      addComment(input: $input) {
        commentEdge {
          node {
            id
            published
            body
            parent {
              id
            }
            author {
              id
            }
            authorName
            authorEmail
          }
        }
      }
    }",
    "variables": {
      "input": {
        "commentableId": "eventComment1",
        "authorName": "Kéké",
        "authorEmail": "vivele94@cap-collectif.com",
        "body": "Ma super réponse"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addComment": {
          "commentEdge": {
              "node": {
                  "id": @uuid@,
                  "parent": {
                    "id": "eventComment1"
                  },
                  "published": true,
                  "body": "Ma super réponse",
                  "author": null,
                  "authorName": "Kéké",
                  "authorEmail": "vivele94@cap-collectif.com"
              }
          }
       }
     }
  }
  """
