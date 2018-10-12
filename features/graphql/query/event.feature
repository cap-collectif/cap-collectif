@event @dev
Feature: Events

Scenario: GraphQL client wants to list events
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      events(first: 5) {
        totalCount
        edges {
          node {
            id
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
        "events":{
           "totalCount":10,
           "edges":[
              {
                 "node":{
                    "id":"event1"
                 }
              },
              {
                 "node":{
                    "id":"event10"
                 }
              },
              {
                 "node":{
                    "id":"event2"
                 }
              },
              {
                 "node":{
                    "id":"event3"
                 }
              },
              {
                 "node":{
                    "id":"event4"
                 }
              }
           ]
        }
     }
  }
  """

Scenario: GraphQL client wants to list passed events
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      events(first: 5, time: FUTURE) {
        totalCount
        edges {
          node {
            id
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
      "events":{
         "totalCount":4,
         "edges":[
            {
               "node":{
                  "id":"event8"
               }
            },
            {
               "node":{
                  "id":"event10"
               }
            },
            {
               "node":{
                  "id":"event7"
               }
            },
            {
               "node":{
                  "id":"event9"
               }
            }
         ]
      }
   }
}
  """

Scenario: GraphQL client wants to list current and future events
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "{
      events(first: 5, time: PASSED) {
        totalCount
        edges {
          node {
            id
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
        "events":{
           "totalCount":2,
           "edges":[
              {
                 "node":{
                    "id":"event2"
                 }
              },
              {
                 "node":{
                    "id":"event5"
                 }
              }
           ]
        }
     }
  }
  """
