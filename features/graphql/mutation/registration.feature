@register
Feature: register

@database
Scenario: GraphQL client wants to register
  Given feature "registration" is enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation Register($input: RegisterInput!) {
      register(input: $input) {
        user {
          displayName
        }
        errorsCode
      }
    }",
    "variables": {
      "input": {
        "username": "user2",
        "email": "user2@gmail.com",
        "plainPassword": "supersecureuserpass",
        "captcha": "fakekey",
        "responses": [
          {
            "question": "UXVlc3Rpb246Ng==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTc=",
            "value": "Sangohan"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"register":{"user":{"displayName":"user2"}, "errorsCode":null}}}
  """

@database
Scenario: GraphQL client wants to register but registration is not enabled
  Given feature "registration" is disabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation Register($input: RegisterInput!) {
      register(input: $input) {
        errorsCode
      }
    }",
    "variables": {
      "input": {
        "username": "user2",
        "email": "user2@gmail.com",
        "plainPassword": "supersecureuserpass",
        "captcha": "fakekey",
        "responses": [
          {
            "question": "UXVlc3Rpb246Ng==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTc=",
            "value": "Sangohan"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"register":{"errorsCode":["REGISTER_FEATURE_NOT_ENABLED"]}}}
  """

@database 
Scenario: GraphQL client wants to register without email
  Given feature "registration" is enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation Register($input: RegisterInput!) {
      register(input: $input) {
        errorsCode
      }
    }",
    "variables": {
      "input": {
        "username": "user2",
        "email": "",
        "plainPassword": "supersecureuserpass",
        "captcha": "fakekey",
        "responses": [
          {
            "question": "UXVlc3Rpb246Ng==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTc=",
            "value": "Sangohan"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"register":{"errorsCode":["EMAIL_BLANK"]}}}
  """

@database 
Scenario: GraphQL client wants to register without username
  Given feature "registration" is enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation Register($input: RegisterInput!) {
      register(input: $input) {
        errorsCode
      }
    }",
    "variables": {
      "input": {
        "username": "",
        "email": "user2@gmail.com",
        "plainPassword": "supersecureuserpass",
        "captcha": "fakekey",
        "responses": [
          {
            "question": "UXVlc3Rpb246Ng==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTc=",
            "value": "Sangohan"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"register":{"errorsCode":["USERNAME_BLANK"]}}}
  """

@database 
Scenario: GraphQL client wants to register without password
  Given feature "registration" is enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation Register($input: RegisterInput!) {
      register(input: $input) {
        errorsCode
      }
    }",
    "variables": {
      "input": {
        "username": "user2",
        "email": "user2@gmail.com",
        "plainPassword": "",
        "captcha": "fakekey",
        "responses": [
          {
            "question": "UXVlc3Rpb246Ng==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTc=",
            "value": "Sangohan"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"register":{"errorsCode":["PASSWORD_BLANK"]}}}
  """

@database 
Scenario: GraphQL client wants to register throwable email
  Given feature "registration" is enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation Register($input: RegisterInput!) {
      register(input: $input) {
        errorsCode
      }
    }",
    "variables": {
      "input": {
        "username": "user2",
        "email": "user2@yopmail.com",
        "plainPassword": "supersecureuserpass",
        "captcha": "fakekey",
        "responses": [
          {
            "question": "UXVlc3Rpb246Ng==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTc=",
            "value": "Sangohan"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"register":{"errorsCode":["EMAIL_THROWABLE"]}}}
  """

@database
Scenario: GraphQL client wants to register with unknown additional data
  Given feature "registration" is enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation Register($input: RegisterInput!) {
      register(input: $input) {
        errorsCode
      }
    }",
    "variables": {
      "input": {
        "username": "user2",
        "email": "user2@gmail.com",
        "plainPassword": "supersecureuserpass",
        "captcha": "fakekey",
        "zipcode": "99999",
        "userType": "2",
        "responses": [
          {
            "question": "UXVlc3Rpb246Ng==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTc=",
            "value": "Sangohan"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"register":{"errorsCode":["NO_EXTRA_FIELDS"]}}}
  """

@database
Scenario: GraphQL client wants to register with zipcode and type
  Given features "registration", "user_type", "zipcode_at_register" are enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation Register($input: RegisterInput!) {
      register(input: $input) {
        user {
          displayName
        }
        errorsCode
      }
    }",
    "variables": {
      "input": {
        "username": "user2",
        "email": "user2@gmail.com",
        "plainPassword": "supersecureuserpass",
        "captcha": "fakekey",
        "zipcode": "99999",
        "userType": "1",
        "responses": [
          {
            "question": "UXVlc3Rpb246Ng==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTc=",
            "value": "Sangohan"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"register":{"user":{"displayName":"user2"}, "errorsCode":null}}}
  """

@database
Scenario: GraphQL client wants to hack register form with username payload
  Given feature "registration" is enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation Register($input: RegisterInput!) {
      register(input: $input) {
        errorsCode
      }
    }",
    "variables": {
      "input": {
        "username": "<h1><a href=x></a>pwned</h1>",
        "email": "pwned@gmail.com",
        "plainPassword": "supersecureuserpass",
        "captcha": "fakekey",
        "responses": [
          {
            "question": "UXVlc3Rpb246Ng==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTc=",
            "value": "Sangohan"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"register":{"errorsCode":null}}}
  """
  Then user identified by email "pwned@gmail.com" should have username "pwned"

@database
Scenario: GraphQL client wants to register when invited to a group
  Given feature "registration" is enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation Register($input: RegisterInput!) {
      register(input: $input) {
        user {
          displayName
          groups {
            edges {
              node {
                id
              }
            }
          }
        }
        errorsCode
      }
    }",
    "variables": {
      "input": {
        "username": "user invited in group",
        "email": "user-invited-in-group@gmail.com",
        "plainPassword": "supersecureuserpass",
        "captcha": "fakekey",
        "invitationToken": "invitedgrouptoken",
        "responses": [
          {
            "question": "UXVlc3Rpb246Ng==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTc=",
            "value": "Sangohan"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "register": {
        "user": {
          "displayName": "user invited in group",
          "groups": {
            "edges": [
              {
                "node": {
                  "id": "R3JvdXA6Z3JvdXAx"
                }
              }
            ]
          }
        },
        "errorsCode": null
      }
    }
  }
  """
