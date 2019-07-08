@addEvent @event
Feature: Add Event

@database
Scenario: Admin wants to add an event
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: AddEventInput!) {
      addEvent(input: $input) {
        eventEdge {
          node {
            id
            title
            body
            author {
              _id
            }
            timeRange {
              startAt
              endAt
            }
            themes {
              id
            }
            projects {
              id
            }
            address
            link
            commentable
            address
            zipCode
            city
            country
          }
        }
      }
    }",
    "variables": {
      "input": {
        "title": "Rencontre avec les habitants",
        "body": "Tout le monde est invité",
        "startAt": "2018-03-07 00:00:00",
        "endAt": "2018-03-16 00:00:00",
        "themes": ["theme1"],
        "projects": ["UHJvamVjdDpwcm9qZWN0MQ==","UHJvamVjdDpwcm9qZWN0Mg=="],
        "address": "25 rue Claude Tillier",
        "zipCode": "75012",
        "commentable": false,
        "enabled": true,
        "registrationEnable": true,
        "metaDescription": "metaDescription",
        "customCode": "customCode",
        "city": "Paris",
        "country": "France",
        "link": "https://facebook.com/inscrivez-vous-ici"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "addEvent":{
           "eventEdge":{
              "node":{
                 "id": @string@,
                 "title":"Rencontre avec les habitants",
                 "body":"Tout le monde est invit\u00e9",
                 "author":{
                    "_id":"userAdmin"
                 },
                 "timeRange":{
                    "startAt":"2018-03-07 00:00:00",
                    "endAt":"2018-03-16 00:00:00"
                 },
                 "themes":[
                    {
                       "id":"theme1"
                    }
                 ],
                 "projects":[
                    {
                       "id":"UHJvamVjdDpwcm9qZWN0MQ=="
                    },
                    {
                       "id":"UHJvamVjdDpwcm9qZWN0Mg=="
                    }
                 ],
                 "address":"25 rue Claude Tillier",
                 "link":"https:\/\/facebook.com\/inscrivez-vous-ici",
                 "commentable":false,
                 "zipCode":"75012",
                 "city":"Paris",
                 "country":"France"
              }
           }
        }
     }
  }
  """

@database
Scenario: User wants to add an event
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
   {
    "query": "mutation ($input: AddEventInput!) {
      addEvent(input: $input) {
        eventEdge {
          node {
            id
            title
            body
            customCode
          }
        }
        userErrors {
          message
        }
      }
    }",
    "variables": {
      "input": {
        "title": "Rencontre avec les habitants",
        "body": "Tout le monde est invité",
        "startAt": "2018-03-07 00:00:00",
        "customCode": "customCode",
        "registrationEnable": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
   {"data":{"addEvent":{"eventEdge":null,"userErrors":[{"message":"You are not authorized to add customCode field."}]}}}
  """
