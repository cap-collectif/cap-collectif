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
            googleMapsAddress {
              json
              formatted
            }
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
                 "link":null,
                 "commentable":false,
                 "googleMapsAddress":{
                    "json":"[{\u0022address_components\u0022:[{\u0022long_name\u0022:\u002225\u0022,\u0022short_name\u0022:\u002225\u0022,\u0022types\u0022:[\u0022street_number\u0022]},{\u0022long_name\u0022:\u0022Rue Claude Tillier\u0022,\u0022short_name\u0022:\u0022Rue Claude Tillier\u0022,\u0022types\u0022:[\u0022route\u0022]},{\u0022long_name\u0022:\u0022Paris\u0022,\u0022short_name\u0022:\u0022Paris\u0022,\u0022types\u0022:[\u0022locality\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022Arrondissement de Paris\u0022,\u0022short_name\u0022:\u0022Arrondissement de Paris\u0022,\u0022types\u0022:[\u0022administrative_area_level_2\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022\u00cele-de-France\u0022,\u0022short_name\u0022:\u0022\u00cele-de-France\u0022,\u0022types\u0022:[\u0022administrative_area_level_1\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022France\u0022,\u0022short_name\u0022:\u0022FR\u0022,\u0022types\u0022:[\u0022country\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u002275012\u0022,\u0022short_name\u0022:\u002275012\u0022,\u0022types\u0022:[\u0022postal_code\u0022]}],\u0022formatted_address\u0022:\u002225 Rue Claude Tillier, 75012 Paris, France\u0022,\u0022geometry\u0022:{\u0022bounds\u0022:{\u0022south\u0022:48.8484736,\u0022west\u0022:2.3882939999999735,\u0022north\u0022:48.8485762,\u0022east\u0022:2.388451199999963},\u0022location\u0022:{\u0022lat\u0022:48.8485327,\u0022lng\u0022:2.3883663000000297},\u0022location_type\u0022:\u0022ROOFTOP\u0022,\u0022viewport\u0022:{\u0022south\u0022:48.8471759197085,\u0022west\u0022:2.3870236197085433,\u0022north\u0022:48.8498738802915,\u0022east\u0022:2.389721580291507}},\u0022place_id\u0022:\u0022ChIJGRpmzgxy5kcRPt50gCGa7kM\u0022,\u0022types\u0022:[\u0022premise\u0022]}]",
                    "formatted":"25 Rue Claude Tillier, 75012 Paris, France"
                 }
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
Scenario: User wants to add an event with bad date
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
        "startAt": "2018-04-07 00:00:00",
        "endAt": "2018-03-07 00:00:00",
        "guestListEnabled": true
      }
    }
  }
  """
    Then the JSON response should match:
  """
{"data":{"addEvent":{"eventEdge":null,"userErrors":[{"message":"La date de fin ne peut pas \u00eatre ant\u00e9rieure \u00e0 la date de d\u00e9but.\nSi l\u0027\u00e9v\u00e8nement ne dure qu\u0027une journ\u00e9e, ne renseignez pas de date de fin."}]}}}
  """

@database
Scenario: User wants to add an event with 2 registration type
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
            guestListEnabled
            link
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
        "startAt": "2018-04-07 00:00:00",
        "guestListEnabled": true,
        "link": "weezevent.com"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"addEvent":{"eventEdge":null,"userErrors":[{"message":"Veuillez choisir un seul mode d\u2019inscription"}]}}}
  """
