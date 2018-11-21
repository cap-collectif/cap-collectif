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
            _id
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
                    "_id":"evenementFutureSansDateDeFin"
                 }
              },
              {
                 "node":{
                    "_id":"evenementPasseSansDateDeFin"
                 }
              },
              {
                 "node":{
                    "_id":"evenementSansDateDeFin"
                 }
              },
              {
                 "node":{
                    "_id":"event1"
                 }
              },
              {
                 "node":{
                    "_id":"event10"
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
            _id
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
                    "_id":"evenementFutureSansDateDeFin"
                 }
              },
              {
                 "node":{
                    "_id":"event4"
                 }
              },
              {
                 "node":{
                    "_id":"event3"
                 }
              },
              {
                 "node":{
                    "_id":"event1"
                 }
              },
              {
                 "node":{
                    "_id":"event6"
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
            _id
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
                  "_id":"evenementPasseSansDateDeFin"
               }
            },
            {
               "node":{
                  "_id":"evenementSansDateDeFin"
               }
            },
            {
               "node":{
                  "_id":"event5"
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
            _id
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
                  "_id":"evenementPasseSansDateDeFin",
                  "projects":[
                     {
                        "id":"project1"
                     }
                  ]
               }
            },
            {
               "node":{
                  "_id":"event1",
                  "projects":[
                     {
                        "id":"project1"
                     }
                  ]
               }
            },
            {
               "node":{
                  "_id":"event2",
                  "projects":[
                     {
                        "id":"project1"
                     }
                  ]
               }
            },
            {
               "node":{
                  "_id":"event3",
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
            _id
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
                  "_id":"evenementPasseSansDateDeFin",
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
                  "_id":"event1",
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
                  "_id":"event2",
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
            _id
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
                    "_id":"event1"
                 }
              },
              {
                 "node":{
                    "_id":"event6"
                 }
              }
           ]
        }
     }
  }
  """
