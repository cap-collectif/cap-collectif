@delete_account
Feature: Delete user contributions

@database
Scenario: User who decide to soft delete his account should have his contents anonymized but not deleted. His personnal datas should be deleted.
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteAccountInput!) {
      deleteAccount(input: $input) {
        userId
      }
    }",
    "variables": {
      "input": {
        "type": "SOFT"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteAccount": {
         "userId": "VXNlcjp1c2VyNQ=="
      }
    }
  }
  """

@database @dev
Scenario: User who decide to hard delete his account should have his contents anonymized and deleted. His personnal datas should be deleted too.
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: DeleteAccountInput!) {
      deleteAccount(input: $input) {
        userId
      }
    }",
    "variables": {
      "input": {
        "type": "HARD"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "deleteAccount": {
         "userId": "VXNlcjp1c2VyNQ=="
      }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "query ($stepId: ID!) {
      step: node(id: $stepId) {
        ... on ProposalStep {
            proposals {
              totalCount
              edges {
                node {
                   id
                   published
                   author {
                      id
                   }

                }
              }
            }
            form {
              isProposalForm
            }
         }
      }
    }",
    "variables": {
      "stepId": "Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAx",
      "count": 100
    }
  }
  """
  Then the JSON response should match:
  """
{
   "data":{
      "step":{
         "proposals":{
            "totalCount":6,
            "edges":[
               {
                  "node":{
                     "id":"UHJvcG9zYWw6cHJvcG9zYWwx",
                     "published":true,
                     "author":{
                        "id":"VXNlcjp1c2VyNTAy"
                     }
                  }
               },
               {
                  "node":{
                     "id":"UHJvcG9zYWw6cHJvcG9zYWwz",
                     "published":true,
                     "author":{
                        "id":"VXNlcjp1c2VyNTAy"
                     }
                  }
               },
               {
                  "node":{
                     "id":"UHJvcG9zYWw6cHJvcG9zYWw0",
                     "published":true,
                     "author":{
                        "id":"VXNlcjp1c2VyNw=="
                     }
                  }
               },
               {
                  "node":{
                     "id":"UHJvcG9zYWw6cHJvcG9zYWwxMA==",
                     "published":true,
                     "author":{
                        "id":"VXNlcjp1c2VyQWRtaW4="
                     }
                  }
               },
               {
                  "node":{
                     "id":"UHJvcG9zYWw6cHJvcG9zYWwxMQ==",
                     "published":true,
                     "author":{
                        "id":"VXNlcjp1c2VyQWRtaW4="
                     }
                  }
               },
               {
                  "node":{
                     "id":"UHJvcG9zYWw6cHJvcG9zYWwxMDQ=",
                     "published":true,
                     "author":{
                        "id":"VXNlcjp1c2VyQWRtaW4="
                     }
                  }
               }
            ]
         },
         "form":{
            "isProposalForm":true
         }
      }
   }
}
  """
