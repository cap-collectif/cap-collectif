@addComment @add
Feature: Add Comment

@database
Scenario: User wants to add a comment on a proposal
  Given I am logged in to graphql as user
  Given feature moderation_comment is disabled
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
            moderationStatus
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
                  "id": @string@,
                  "published": true,
                  "body": "Tololo",
                  "moderationStatus": "APPROVED",
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
                  "id": @string@,
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
Scenario: Anonymous wants to add a comment on a blog post when moderation is enabled
  Given feature moderation_comment is enabled
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
                  "id": @string@,
                  "published": false,
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
        "commentableId": "Q29tbWVudDpldmVudENvbW1lbnQx",
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
                  "id": @string@,
                  "parent": {
                    "id": "Q29tbWVudDpldmVudENvbW1lbnQx"
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

@database 
Scenario: User wants to comment when moderation is enabled
  Given feature moderation_comment is enabled
  Given I am logged in to graphql as user
  Given I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddCommentInput!) {
      addComment(input: $input) {
        commentEdge {
          node {
            id
            moderationStatus
            body
          }
        }
      }
    }",
    "variables": {
      "input": {
        "commentableId": "Q29tbWVudDpldmVudENvbW1lbnQx",
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
                  "id": @string@,
                  "body": "Ma super réponse",
                  "moderationStatus": "PENDING"
              }
          }
       }
     }
  }
  """

@database 
Scenario: User wants to comment when moderation is disabled
  Given feature moderation_comment is disabled
  Given I am logged in to graphql as user
  Given I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddCommentInput!) {
      addComment(input: $input) {
        commentEdge {
          node {
            id
            moderationStatus
            body
          }
        }
      }
    }",
    "variables": {
      "input": {
        "commentableId": "Q29tbWVudDpldmVudENvbW1lbnQx",
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
                  "id": @string@,
                  "body": "Ma super réponse",
                  "moderationStatus": "APPROVED"
              }
          }
       }
     }
  }
  """

@database 
Scenario: Admin wants to comment
  Given feature moderation_comment is enabled
  Given I am logged in to graphql as admin
  Given I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddCommentInput!) {
      addComment(input: $input) {
        commentEdge {
          node {
            id
            moderationStatus
            body
          }
        }
      }
    }",
    "variables": {
      "input": {
        "commentableId": "Q29tbWVudDpldmVudENvbW1lbnQx",
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
                  "id": @string@,
                  "body": "Ma super réponse",
                  "moderationStatus": "APPROVED"
              }
          }
       }
     }
  }
  """
