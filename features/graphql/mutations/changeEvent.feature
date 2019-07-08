@changeEvent @event
Feature: Change Event

@database
Scenario: Admin wants to change an event
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: ChangeEventInput!) {
      changeEvent(input: $input) {
        event {
          _id
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
    }",
    "variables": {
      "input": {
        "id": "RXZlbnQ6ZXZlbnQx",
        "title": "Rencontre avec les habitants",
        "body": "Tout le monde est invité",
        "startAt": "2018-04-07 00:00:00",
        "endAt": "2018-05-16 00:00:00",
        "themes": ["theme1", "theme2"],
        "registrationEnable": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "changeEvent":{
           "event":{
               "_id":"event1",
               "title":"Rencontre avec les habitants",
               "body":"Tout le monde est invit\u00e9",
               "author":{
                  "_id":"user1"
               },
               "timeRange":{
                  "startAt":"2018-04-07 00:00:00",
                  "endAt":"2018-05-16 00:00:00"
               },
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
                     "id":"UHJvamVjdDpwcm9qZWN0MQ=="
                  }
               ],
               "address":"111 Avenue Cl\u00e9menceau",
               "link":null,
               "commentable":true,
               "zipCode":null,
               "city":"Lyon",
               "country":null
            }
         }
     }
  }
  """

@database
Scenario: User wants to change an event
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
   {
    "query": "mutation ($input: ChangeEventInput!) {
      changeEvent(input: $input) {
        event {
          id
          title
          body
          customCode
        }
        userErrors {
          message
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RXZlbnQ6ZXZlbnQx",
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
    {"data":{"changeEvent":{"event":null,"userErrors":[{"message":"You are not authorized to add customCode field."}]}}}
  """
