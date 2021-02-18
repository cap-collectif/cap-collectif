@jitsi
Feature: Generate Jitsi room

@database
Scenario: GraphQL client wants to generate a jitsi room for an event
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: GenerateJitsiRoomMutationInput!) {
      generateJitsiRoomMutation(input: $input) {
        jitsiToken
        roomName
      }
    }",
    "variables": {
      "input": {
        "eventId": "RXZlbnQ6Y29zbW9wb2xpdGVFdmVudA=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "generateJitsiRoomMutation": {
        "jitsiToken": @string@,
        "roomName": @string@
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to generate a jitsi room for an event, but give wrong eventId
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: GenerateJitsiRoomMutationInput!) {
      generateJitsiRoomMutation(input: $input) {
        jitsiToken
        roomName
      }
    }",
    "variables": {
      "input": {
        "eventId": "NotExistingId"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "errors":[
        {
           "message":"Could not find this event.",
           "extensions":{
              "@*@": "@*@"
           },
           "locations":[
              {
                 "line":1,
                 "column":57
              }
           ],
           "path":[
              "generateJitsiRoomMutation"
           ]
        }
     ],
     "data":{
        "generateJitsiRoomMutation":null
     }
  }
  """
