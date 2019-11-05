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
          url
          commentable
          review {
              createdAt
              status
              reviewer {
                id
                username
              }
          }
          googleMapsAddress {
            json
            formatted
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RXZlbnQ6ZXZlbnQy",
        "title": "Rencontre avec les habitants",
        "body": "Tout le monde est invité",
        "startAt": "2018-04-07 00:00:00",
        "endAt": "2018-05-16 00:00:00",
        "themes": ["theme1", "theme2"],
        "guestListEnabled": true
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
              "_id":"event2",
              "title":"Rencontre avec les habitants",
              "body":"Tout le monde est invit\u00e9",
              "author":{
                 "_id":"user2"
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
              "url":"https:\/\/capco.test\/events\/phptourdufuture",
              "commentable":true,
              "review":null,
              "googleMapsAddress":{
                 "json":"[{\u0022address_components\u0022:[{\u0022long_name\u0022:\u0022Tour Eiffel\u0022,\u0022short_name\u0022:\u0022Tour Eiffel\u0022,\u0022types\u0022:[\u0022bus_station\u0022,\u0022establishment\u0022,\u0022point_of_interest\u0022,\u0022transit_station\u0022]},{\u0022long_name\u0022:\u0022Paris\u0022,\u0022short_name\u0022:\u0022Paris\u0022,\u0022types\u0022:[\u0022locality\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022Paris\u0022,\u0022short_name\u0022:\u0022Paris\u0022,\u0022types\u0022:[\u0022administrative_area_level_2\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022\\u00cele-de-France\u0022,\u0022short_name\u0022:\u0022\\u00cele-de-France\u0022,\u0022types\u0022:[\u0022administrative_area_level_1\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022France\u0022,\u0022short_name\u0022:\u0022FR\u0022,\u0022types\u0022:[\u0022country\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u002275007\u0022,\u0022short_name\u0022:\u002275007\u0022,\u0022types\u0022:[\u0022postal_code\u0022]}],\u0022formatted_address\u0022:\u0022Tour Eiffel, 75007 Paris, France\u0022,\u0022geometry\u0022:{\u0022location\u0022:{\u0022lat\u0022:48.860489,\u0022lng\u0022:2.2959102},\u0022location_type\u0022:\u0022GEOMETRIC_CENTER\u0022,\u0022viewport\u0022:{\u0022northeast\u0022:{\u0022lat\u0022:48.8618379802915,\u0022lng\u0022:2.297259180291502},\u0022southwest\u0022:{\u0022lat\u0022:48.85914001970851,\u0022lng\u0022:2.294561219708498}}},\u0022place_id\u0022:\u0022ChIJARsZE-Fv5kcRr1x6No4iL28\u0022,\u0022plus_code\u0022:{\u0022compound_code\u0022:\u0022V76W+59 Paris, France\u0022,\u0022global_code\u0022:\u00228FW4V76W+59\u0022},\u0022types\u0022:[\u0022bus_station\u0022,\u0022establishment\u0022,\u0022point_of_interest\u0022,\u0022transit_station\u0022]}]",
                 "formatted":"Tour Eiffel, 75007 Paris, France"
              }
           }
        }
     }
  }
  """

@database
Scenario: Admin wants to change an event with external to register
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
          url
          link
          guestListEnabled
          commentable
          googleMapsAddress {
            json
            formatted
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RXZlbnQ6ZXZlbnQy",
        "title": "Rencontre avec les habitants",
        "body": "Tout le monde est invité",
        "startAt": "2018-04-07 00:00:00",
        "endAt": "2018-05-16 00:00:00",
        "themes": ["theme1", "theme2"],
        "link": "http://perdu.com"
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
              "_id":"event2",
              "title":"Rencontre avec les habitants",
              "body":"Tout le monde est invit\u00e9",
              "author":{
                 "_id":"user2"
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
              "url":"https:\/\/capco.test\/events\/phptourdufuture",
              "link":"http:\/\/perdu.com",
              "guestListEnabled":false,
              "commentable":true,
              "googleMapsAddress":{
                 "json":"[{\u0022address_components\u0022:[{\u0022long_name\u0022:\u0022Tour Eiffel\u0022,\u0022short_name\u0022:\u0022Tour Eiffel\u0022,\u0022types\u0022:[\u0022bus_station\u0022,\u0022establishment\u0022,\u0022point_of_interest\u0022,\u0022transit_station\u0022]},{\u0022long_name\u0022:\u0022Paris\u0022,\u0022short_name\u0022:\u0022Paris\u0022,\u0022types\u0022:[\u0022locality\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022Paris\u0022,\u0022short_name\u0022:\u0022Paris\u0022,\u0022types\u0022:[\u0022administrative_area_level_2\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022\\u00cele-de-France\u0022,\u0022short_name\u0022:\u0022\\u00cele-de-France\u0022,\u0022types\u0022:[\u0022administrative_area_level_1\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022France\u0022,\u0022short_name\u0022:\u0022FR\u0022,\u0022types\u0022:[\u0022country\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u002275007\u0022,\u0022short_name\u0022:\u002275007\u0022,\u0022types\u0022:[\u0022postal_code\u0022]}],\u0022formatted_address\u0022:\u0022Tour Eiffel, 75007 Paris, France\u0022,\u0022geometry\u0022:{\u0022location\u0022:{\u0022lat\u0022:48.860489,\u0022lng\u0022:2.2959102},\u0022location_type\u0022:\u0022GEOMETRIC_CENTER\u0022,\u0022viewport\u0022:{\u0022northeast\u0022:{\u0022lat\u0022:48.8618379802915,\u0022lng\u0022:2.297259180291502},\u0022southwest\u0022:{\u0022lat\u0022:48.85914001970851,\u0022lng\u0022:2.294561219708498}}},\u0022place_id\u0022:\u0022ChIJARsZE-Fv5kcRr1x6No4iL28\u0022,\u0022plus_code\u0022:{\u0022compound_code\u0022:\u0022V76W+59 Paris, France\u0022,\u0022global_code\u0022:\u00228FW4V76W+59\u0022},\u0022types\u0022:[\u0022bus_station\u0022,\u0022establishment\u0022,\u0022point_of_interest\u0022,\u0022transit_station\u0022]}]",
                 "formatted":"Tour Eiffel, 75007 Paris, France"
              }
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
        "guestListEnabled": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"changeEvent":{"event":null,"userErrors":[{"message":"You are not authorized to add customCode field."}]}}}
  """
