@addEvents
Feature: Add events.

Scenario: An admin wants to add a list of events with dry run
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddEventsInput!) {
      addEvents(input: $input) {
        importedEvents {
          id
          title
          body
          startAt
          endAt
          author {
            id
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
        "events": [
          {
            "title": "Rencontre avec les habitants",
            "body": "<h1>Mon super event</h1><p>Rassurez vous, tout le monde est invité</p>",
            "startAt": "2018-03-07 00:00:00",
            "endAt": "2018-03-16 00:00:00",
            "authorEmail": "aurelien@cap-collectif.com",
            "themes": ["theme1"],
            "projects": ["project1","project2"],
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
        ],
        "dryRun": false
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "addEvents": {
        "importedEvents": [
          { 
            "id": @string@,
            "title": "Rencontre avec les habitants",
            "body": "<h1>Mon super event</h1><p>Rassurez vous, tout le monde est invité</p>",
            "startAt": "2018-03-07 00:00:00",
            "endAt": "2018-03-16 00:00:00",
            "author": {
              "id": "VXNlcjp1c2VyNTAx"
            },
            "themes": [
              {
                "id": "theme1"
              }
            ],
            "projects": [
              {
                "id": "project1"
              },
              {
                "id": "project2"
              }
            ],
            "commentable": false,
            "address": "25 rue Claude Tillier",
            "zipCode": "75012",
            "city": "Paris",
            "country": "France",
            "link": "https://facebook.com/inscrivez-vous-ici"
          }
        ]
      }
    }
  }
  """
