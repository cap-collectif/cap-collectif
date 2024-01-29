@addEvents @events @admin
Feature: Add events.

@database
Scenario: An admin wants to add a list of events with dry run
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddEventsInput!) {
      addEvents(input: $input) {
        importedEvents {
          id
          timeRange {
            startAt
            endAt
          }
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
          commentable
          address
          zipCode
          city
          country
          translations {
            title
            body
            link
          }
          districts {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "events": [
          {
            "startAt": "2018-03-07 00:00:00",
            "endAt": "2018-03-16 00:00:00",
            "authorEmail": "aurelien@cap-collectif.com",
            "themes": ["Immobilier"],
            "projects": ["Projet externe","Croissance, innovation, disruption"],
            "address": "25 rue Claude Tillier",
            "zipCode": "75012",
            "commentable": false,
            "enabled": true,
            "guestListEnabled": true,
            "customCode": "customCode",
            "city": "Paris",
            "country": "France",
            "translations": [
              {
                "locale": "fr-FR",
                "title": "Rencontre avec les habitants",
                "body": "<h1>Mon super event</h1><p>Rassurez vous, tout le monde est invité</p>",
                "metaDescription": "metaDescription",
                "link": "https://facebook.com/inscrivez-vous-ici"
              }
            ],
            "districts": ["Premier Quartier"]
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
            "timeRange": {
              "startAt": "2018-03-07 00:00:00",
              "endAt": "2018-03-16 00:00:00"
            },
            "author": {
              "id": "VXNlcjp1c2VyU3B5bA=="
            },
            "themes": [
              {
                "id": "theme1"
              }
            ],
            "projects": [
              {
                "id": "UHJvamVjdDpleHRlcm5hbFByb2plY3Q="
              },
              {
                "id": "UHJvamVjdDpwcm9qZWN0MQ=="
              }
            ],
            "commentable": false,
            "address": "25 rue Claude Tillier",
            "zipCode": "75012",
            "city": "Paris",
            "country": "France",
            "translations": [
              {
                "title": "Rencontre avec les habitants",
                "body": "<h1>Mon super event</h1><p>Rassurez vous, tout le monde est invité</p>",
                "link": "https://facebook.com/inscrivez-vous-ici"
              }
            ],
            "districts": {
              "edges": [
                {
                  "node": {
                    "id": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx"
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }
  """
