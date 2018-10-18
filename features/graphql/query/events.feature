@events @read-only
Feature: Events

Scenario: GraphQL client wants to list events
  Given I send a GraphQL POST request:
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

Scenario: GraphQL client wants to list current and future events
  Given I send a GraphQL POST request:
  """
  {
    "query": "{
      events(first: 5, isFuture: true) {
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

Scenario: GraphQL client wants to list passed events
  Given I send a GraphQL POST request:
  """
  {
    "query": "{
      events(first: 5, isFuture: false) {
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

Scenario: GraphQL client wants to list event in project
  Given I send a GraphQL POST request:
  """
  {
    "query": "query getEventsByProject ($projectId: ID!, $first: Int){
      events(project: $projectId, first: $first) {
      totalCount
        edges {
          node {
            id
            themes { id }
            projects { id }
          }
        }
      }
    }",
    "variables": {
      "projectId": "project1",
      "first": 5
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "events":{
           "totalCount":3,
           "edges":[
              {
                 "node":{
                    "id":"event1",
                    "themes":[
                       {
                          "id":"theme1"
                       },
                       {
                          "id":"theme2"
                       }
                    ],
                    "projects":[
                       {
                          "id":"project1"
                       }
                    ]
                 }
              },
              {
                 "node":{
                    "id":"event2",
                    "themes":[
                       {
                          "id":"theme1"
                       },
                       {
                          "id":"theme2"
                       }
                    ],
                    "projects":[
                       {
                          "id":"project1"
                       }
                    ]
                 }
              },
              {
                 "node":{
                    "id":"event3",
                    "themes":[

                    ],
                    "projects":[
                       {
                          "id":"project1"
                       }
                    ]
                 }
              }
           ]
        }
     }
  }
  """

Scenario: GraphQL client wants to list events with theme2
  Given I send a GraphQL POST request:
  """
  {
    "query": "query getEventsByTheme ($themeId: ID!, $first: Int){
      events(theme: $themeId, first: $first) {
      totalCount
        edges {
          node {
            id
            themes {
              id
            }
          }
        }
      }
    }",
    "variables": {
      "themeId": "theme2",
      "first": 5
    }
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
                    "id":"event1",
                    "themes":[
                       {
                          "id":"theme1"
                       },
                       {
                          "id":"theme2"
                       }
                    ]
                 }
              },
              {
                 "node":{
                    "id":"event2",
                    "themes":[
                       {
                          "id":"theme1"
                       },
                       {
                          "id":"theme2"
                       }
                    ]
                 }
              }
           ]
        }
     }
  }
  """

Scenario: GraphQL client wants to list events from a term
  Given I send a GraphQL POST request:
  """
  {
    "query": "query getEventsByTerm ($term: String!, $first: Int){
      events(term: $term, first: $first) {
      totalCount
        edges {
          node {
            id
            themes { id }
          }
        }
      }
    }",
    "variables": {
      "term": "registrations",
      "first": 5
    }
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
                    "id":"event1",
                    "themes":[
                       {
                          "id":"theme1"
                       },
                       {
                          "id":"theme2"
                       }
                    ]
                 }
              },
              {
                 "node":{
                    "id":"event3",
                    "themes":[

                    ]
                 }
              }
           ]
        }
     }
  }
  """
