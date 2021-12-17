@groups
Feature: Groups

Scenario: GraphQL client wants to list groups
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query {
      groups {
        edges {
          node {
            id
            title
            users {
              totalCount
              edges {
                node {
                  username
                  consentInternalCommunication
                }
              }
            }
            usersConsent: users(consentInternalCommunication: true) {
              totalCount
              edges {
                node {
                  username
                  consentInternalCommunication
                }
              }
            }
            notConsentingUsers: users(consentInternalCommunication: false) {
              totalCount
              edges {
                node {
                  username
                  consentInternalCommunication
                }
              }
            }
          }
        }
      }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "groups":{
           "edges":[
              {
               "node":{
                  "id":"group1",
                  "title":"Super-administrateur",
                  "users":{
                     "totalCount":5,
                     "edges":[
                        {
                           "node":{
                              "username":"lbrunet",
                              "consentInternalCommunication":true
                           }
                        },
                        {
                           "node":{
                              "username":"sfavot",
                              "consentInternalCommunication":false
                           }
                        },
                        @...@
                     ]
                  },
                  "usersConsent":{
                     "totalCount":3,
                     "edges":[
                        {
                           "node":{
                              "username":"lbrunet",
                              "consentInternalCommunication":true
                           }
                        },
                        {
                           "node":{
                              "username":"user",
                              "consentInternalCommunication":true
                           }
                        },
                        {
                           "node":{
                              "username":"spyl",
                              "consentInternalCommunication":true
                           }
                        }
                     ]
                  },
                  "notConsentingUsers":{
                     "totalCount":2,
                     "edges":[
                        {
                           "node":{
                              "username":"sfavot",
                              "consentInternalCommunication":false
                           }
                        },
                        {
                           "node":{
                              "username":"welcomattic",
                              "consentInternalCommunication":false
                           }
                        }
                     ]
                  }
               }
              },
              @...@
           ]
        }
     }
  }
  """
