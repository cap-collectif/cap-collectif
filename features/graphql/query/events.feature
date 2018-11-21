@events @read-only
Feature: Events

Scenario: GraphQL client wants to list events
  Given I send a preview GraphQL POST request:
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
           "totalCount":13,
           "edges":[
              {
                 "node":{
                    "id":"evenementFutureSansDateDeFin"
                 }
              },
              {
                 "node":{
                    "id":"evenementPasseSansDateDeFin"
                 }
              },
              {
                 "node":{
                    "id":"evenementSansDateDeFin"
                 }
              },
              {
                 "node":{
                    "id":"event1"
                 }
              },
              {
                 "node":{
                    "id":"event10"
                 }
              }
           ]
        }
     }
  }
  """

Scenario: GraphQL client wants to list current and future events
  Given I send a preview GraphQL POST request:
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
           "totalCount":10,
           "edges":[
              {
                 "node":{
                    "id":"evenementFutureSansDateDeFin"
                 }
              },
              {
                 "node":{
                    "id":"event4"
                 }
              },
              {
                 "node":{
                    "id":"event3"
                 }
              },
              {
                 "node":{
                    "id":"event1"
                 }
              },
              {
                 "node":{
                    "id":"event6"
                 }
              }
           ]
        }
     }
  }
  """

Scenario: GraphQL client wants to list passed events
  Given I send a preview GraphQL POST request:
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
         "totalCount":3,
         "edges":[
            {
               "node":{
                  "id":"evenementPasseSansDateDeFin"
               }
            },
            {
               "node":{
                  "id":"evenementSansDateDeFin"
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
         "totalCount":4,
         "edges":[
            {
               "node":{
                  "id":"evenementPasseSansDateDeFin",
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
         "totalCount":3,
         "edges":[
            {
               "node":{
                  "id":"evenementPasseSansDateDeFin",
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

Scenario: GraphQL client wants to list events with a search
  Given I send a GraphQL POST request:
  """
  {
    "query": "query getEventsBySearch ($search: String!){
      events(search: $search) {
      totalCount
        edges {
          node {
            id
          }
        }
      }
    }",
    "variables": {
      "search": "registrations"
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
                    "id":"event1"
                 }
              },
              {
                 "node":{
                    "id":"event6"
                 }
              }
           ]
        }
     }
  }
  """
