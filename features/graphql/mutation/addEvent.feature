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
            link
            commentable
            addressJson
            fullAddress
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
        "commentable": false,
        "enabled": true,
        "guestListEnabled": true,
        "metaDescription": "metaDescription",
        "customCode": "customCode",
        "link": "https://facebook.com/inscrivez-vous-ici",
        "addressJson":"[{\"address_components\":[{\"long_name\":\"25\",\"short_name\":\"25\",\"types\":[\"street_number\"]},{\"long_name\":\"Rue Claude Tillier\",\"short_name\":\"Rue Claude Tillier\",\"types\":[\"route\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Arrondissement de Paris\",\"short_name\":\"Arrondissement de Paris\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Île-de-France\",\"short_name\":\"Île-de-France\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"75012\",\"short_name\":\"75012\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"25 Rue Claude Tillier, 75012 Paris, France\",\"geometry\":{\"bounds\":{\"south\":48.8484736,\"west\":2.3882939999999735,\"north\":48.8485762,\"east\":2.388451199999963},\"location\":{\"lat\":48.8485327,\"lng\":2.3883663000000297},\"location_type\":\"ROOFTOP\",\"viewport\":{\"south\":48.8471759197085,\"west\":2.3870236197085433,\"north\":48.8498738802915,\"east\":2.389721580291507}},\"place_id\":\"ChIJGRpmzgxy5kcRPt50gCGa7kM\",\"types\":[\"premise\"]}]"
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
                 "addressJson":"[{\"address_components\":[{\"long_name\":\"25\",\"short_name\":\"25\",\"types\":[\"street_number\"]},{\"long_name\":\"Rue Claude Tillier\",\"short_name\":\"Rue Claude Tillier\",\"types\":[\"route\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Arrondissement de Paris\",\"short_name\":\"Arrondissement de Paris\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Île-de-France\",\"short_name\":\"Île-de-France\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"75012\",\"short_name\":\"75012\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"25 Rue Claude Tillier, 75012 Paris, France\",\"geometry\":{\"bounds\":{\"south\":48.8484736,\"west\":2.3882939999999735,\"north\":48.8485762,\"east\":2.388451199999963},\"location\":{\"lat\":48.8485327,\"lng\":2.3883663000000297},\"location_type\":\"ROOFTOP\",\"viewport\":{\"south\":48.8471759197085,\"west\":2.3870236197085433,\"north\":48.8498738802915,\"east\":2.389721580291507}},\"place_id\":\"ChIJGRpmzgxy5kcRPt50gCGa7kM\",\"types\":[\"premise\"]}]",
                 "link":"https:\/\/facebook.com\/inscrivez-vous-ici",
                 "commentable":false,
                 "fullAddress":"25 Rue Claude Tillier, 75012 Paris, France"

              }
           }
        }
     }
  }
  """

@database
Scenario: User wants to add an event with custom code
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
        "guestListEnabled": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
   {"data":{"addEvent":{"eventEdge":null,"userErrors":[{"message":"You are not authorized to add customCode field."}]}}}
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
        "guestListEnabled": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
    {"data":{"addEvent":{"eventEdge":{"node":{"id": @string@,"title":"Rencontre avec les habitants","body":"Tout le monde est invit\u00e9","customCode":null}},"userErrors":[]}}}
  """
