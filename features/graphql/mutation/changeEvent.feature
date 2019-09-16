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
          googleMapsAddress {
            json
            formatted
          }
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
              "url":"https:\/\/capco.test\/events\/event-with-registrations",
              "commentable":true,
              "googleMapsAddress": {
                "json":"[{\u0022address_components\u0022:[{\u0022long_name\u0022:\u0022111\u0022,\u0022short_name\u0022:\u0022111\u0022,\u0022types\u0022:[\u0022street_number\u0022]},{\u0022long_name\u0022:\u0022Rue Georges Clemenceau\u0022,\u0022short_name\u0022:\u0022Rue Georges Clemenceau\u0022,\u0022types\u0022:[\u0022route\u0022]},{\u0022long_name\u0022:\u0022Sainte-Foy-l\\u00e8s-Lyon\u0022,\u0022short_name\u0022:\u0022Sainte-Foy-l\\u00e8s-Lyon\u0022,\u0022types\u0022:[\u0022locality\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022Rh\\u00f4ne\u0022,\u0022short_name\u0022:\u0022Rh\\u00f4ne\u0022,\u0022types\u0022:[\u0022administrative_area_level_2\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022Auvergne-Rh\\u00f4ne-Alpes\u0022,\u0022short_name\u0022:\u0022Auvergne-Rh\\u00f4ne-Alpes\u0022,\u0022types\u0022:[\u0022administrative_area_level_1\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022France\u0022,\u0022short_name\u0022:\u0022FR\u0022,\u0022types\u0022:[\u0022country\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u002269110\u0022,\u0022short_name\u0022:\u002269110\u0022,\u0022types\u0022:[\u0022postal_code\u0022]}],\u0022formatted_address\u0022:\u0022111 Rue Georges Clemenceau, 69110 Sainte-Foy-l\\u00e8s-Lyon, France\u0022,\u0022geometry\u0022:{\u0022location\u0022:{\u0022lat\u0022:45.7417672,\u0022lng\u0022:4.8058097},\u0022location_type\u0022:\u0022RANGE_INTERPOLATED\u0022,\u0022viewport\u0022:{\u0022northeast\u0022:{\u0022lat\u0022:45.74311618029149,\u0022lng\u0022:4.807158680291503},\u0022southwest\u0022:{\u0022lat\u0022:45.74041821970849,\u0022lng\u0022:4.804460719708498}}},\u0022place_id\u0022:\u0022Ej4xMTEgUnVlIEdlb3JnZXMgQ2xlbWVuY2VhdSwgNjkxMTAgU2FpbnRlLUZveS1sw6hzLUx5b24sIEZyYW5jZSIaEhgKFAoSCQ_BwZLB6_RHESAaJ_l8KGIrEG8\u0022,\u0022types\u0022:[\u0022street_address\u0022]}]",
              "formatted":"111 Rue Georges Clemenceau, 69110 Sainte-Foy-l\u00e8s-Lyon, France"
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
        "id": "RXZlbnQ6ZXZlbnQx",
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
              "url":"https:\/\/capco.test\/events\/event-with-registrations",
              "link":"http:\/\/perdu.com",
              "guestListEnabled":false,
              "commentable":true,
              "googleMapsAddress":{
                 "json":"[{\u0022address_components\u0022:[{\u0022long_name\u0022:\u0022111\u0022,\u0022short_name\u0022:\u0022111\u0022,\u0022types\u0022:[\u0022street_number\u0022]},{\u0022long_name\u0022:\u0022Rue Georges Clemenceau\u0022,\u0022short_name\u0022:\u0022Rue Georges Clemenceau\u0022,\u0022types\u0022:[\u0022route\u0022]},{\u0022long_name\u0022:\u0022Sainte-Foy-l\\u00e8s-Lyon\u0022,\u0022short_name\u0022:\u0022Sainte-Foy-l\\u00e8s-Lyon\u0022,\u0022types\u0022:[\u0022locality\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022Rh\\u00f4ne\u0022,\u0022short_name\u0022:\u0022Rh\\u00f4ne\u0022,\u0022types\u0022:[\u0022administrative_area_level_2\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022Auvergne-Rh\\u00f4ne-Alpes\u0022,\u0022short_name\u0022:\u0022Auvergne-Rh\\u00f4ne-Alpes\u0022,\u0022types\u0022:[\u0022administrative_area_level_1\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u0022France\u0022,\u0022short_name\u0022:\u0022FR\u0022,\u0022types\u0022:[\u0022country\u0022,\u0022political\u0022]},{\u0022long_name\u0022:\u002269110\u0022,\u0022short_name\u0022:\u002269110\u0022,\u0022types\u0022:[\u0022postal_code\u0022]}],\u0022formatted_address\u0022:\u0022111 Rue Georges Clemenceau, 69110 Sainte-Foy-l\\u00e8s-Lyon, France\u0022,\u0022geometry\u0022:{\u0022location\u0022:{\u0022lat\u0022:45.7417672,\u0022lng\u0022:4.8058097},\u0022location_type\u0022:\u0022RANGE_INTERPOLATED\u0022,\u0022viewport\u0022:{\u0022northeast\u0022:{\u0022lat\u0022:45.74311618029149,\u0022lng\u0022:4.807158680291503},\u0022southwest\u0022:{\u0022lat\u0022:45.74041821970849,\u0022lng\u0022:4.804460719708498}}},\u0022place_id\u0022:\u0022Ej4xMTEgUnVlIEdlb3JnZXMgQ2xlbWVuY2VhdSwgNjkxMTAgU2FpbnRlLUZveS1sw6hzLUx5b24sIEZyYW5jZSIaEhgKFAoSCQ_BwZLB6_RHESAaJ_l8KGIrEG8\u0022,\u0022types\u0022:[\u0022street_address\u0022]}]",
                 "formatted":"111 Rue Georges Clemenceau, 69110 Sainte-Foy-l\u00e8s-Lyon, France"
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
