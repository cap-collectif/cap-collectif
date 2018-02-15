@reply
Feature: Reply Restful Api
  As an API client

Scenario: Logged in API client wants to get one of his replies
  Given I am logged in to api as admin
  When I send a GET request to "/api/questionnaires/questionnaire1/replies/2"
  Then the JSON response should match:
  """
  {
    "id": @string@,
    "enabled": @boolean@,
    "createdAt": "@string@.isDateTime()",
    "updatedAt": "@string@.isDateTime()",
    "author": {
      "username": @string@,
      "displayName": @string@,
      "uniqueId": @string@,
      "isAdmin": @boolean@,
      "media": @...@,
      "userType": {
        "id": @integer@,
        "name": @string@,
        "slug": @string@
      },
      "vip": @boolean@,
      "_links": {
        "profile": @string@,
        "settings": @string@
      }
    },
    "responses": [
      {
        "id": @integer@,
        "value": @string@,
        "field": {
          "id": @integer@,
          "question": @string@,
          "type": @string@,
          "helpText": @...@,
          "slug": @string@,
          "required": @boolean@,
          "private": @boolean@
        },
        "updatedAt": "@wildcard@"
      },
      @...@
    ],
    "private": @boolean@
  }
  """

@security
Scenario: Anonymous API client wants to get one reply
  When I send a GET request to "/api/questionnaires/questionnaire1/replies/2"
  Then the JSON response status code should be 401

@security
Scenario: Logged in API client wants to get one reply when he's not the author
  Given I am logged in to api as user
  When I send a GET request to "/api/questionnaires/questionnaire1/replies/2"
  Then the JSON response status code should be 403

Scenario: Logged in API client wants to get his replies
  Given I am logged in to api as admin
  When I send a GET request to "/api/questionnaires/questionnaire1/replies"
  Then the JSON response should match:
  """
  {
    "replies": [
      {
        "id": @string@,
        "enabled": @boolean@,
        "createdAt": "@string@.isDateTime()",
        "updatedAt": "@string@.isDateTime()",
        "author": {
          "username": @string@,
          "displayName": @string@,
          "uniqueId": @string@,
          "isAdmin": @boolean@,
          "media": @...@,
          "userType": {
            "id": @integer@,
            "name": @string@,
            "slug": @string@
          },
          "vip": @boolean@,
          "_links": {
            "profile": @string@,
            "settings": @string@
          }
        },
        "responses": [
          {
            "id": @integer@,
            "value": @string@,
            "field": {
              "id": @integer@,
              "question": @string@,
              "type": @string@,
              "helpText": @...@,
              "slug": @string@,
              "required": @boolean@,
              "private": @boolean@
            },
            "updatedAt": "@wildcard@"
          },
          @...@
        ],
        "private": @boolean@
      }
    ]
  }
  """

@security
Scenario: Logged in API client wants to add a reply
  Given I am logged in to api as user_with_phone_not_phone_confirmed
  When I send a POST request to "/api/questionnaires/questionnaire1/replies" with json:
  """
  {
    "responses": []
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "You must confirm your account via sms to post a reply.",
    "errors": null
  }
  """

@database
Scenario: Logged in API client wants to add a reply
  Given I am logged in to api as user
  When I send a POST request to "/api/questionnaires/questionnaire1/replies" with json:
  """
  {
    "responses": [
      {
        "question": 2,
        "value": "Je pense que c'est la ville parfaite pour organiser les JO"
      },
      {
        "question": 13,
        "value": {
          "labels": ["Athlétisme", "Natation", "Sports collectifs"]
        }
      }
    ]
  }
  """
  Then the JSON response status code should be 201
  And 1 mail should be sent
  And I open mail with subject "reply.acknowledgement.subject"
  Then I should see "reply.acknowledgement.replies" in mail

@database
Scenario: Logged in API client wants to add an anonymous reply
  Given I am logged in to api as user
  When I send a POST request to "/api/questionnaires/questionnaire1/replies" with json:
  """
  {
    "responses": [
      {
        "question": 2,
        "value": "Je pense que c'est la ville parfaite pour organiser les JO"
      },
      {
        "question": 13,
        "value": {
          "labels": ["Athlétisme", "Natation", "Sports collectifs"]
        }
      }
    ],
    "private": true
  }
  """
  Then the JSON response status code should be 201

@security
Scenario: Anonymous API client wants to add a reply
  Given I send a POST request to "/api/questionnaires/questionnaire1/replies" with json:
  """
  {
    "responses": [
      {
        "question": 2,
        "value": "Je pense que c'est la ville parfaite pour organiser les JO"
      },
      {
        "question": 13,
        "value": {
          "labels": ["Athlétisme", "Natation", "Sports collectifs"]
        }
      }
    ]
  }
  """
  Then the JSON response status code should be 401

@security
Scenario: Logged in API client wants to add a reply without a required response
  Given I am logged in to api as user
  When I send a POST request to "/api/questionnaires/questionnaire1/replies" with json:
  """
  {
    "responses": [
      {
        "question": 13,
        "value": {
          "labels": ["Athlétisme", "Natation", "Sports collectifs"]
        }
      }
    ]
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Validation Failed",
    "errors": {
      "errors": ["reply.missing_required_responses {\"missing\":2}"],
      "children": @...@
    }
  }
  """

@security
Scenario: Logged in API client wants to add a reply with not enough choices for required field with validation rules
  Given I am logged in to api as user
  When I send a POST request to "/api/questionnaires/questionnaire1/replies" with json:
  """
  {
    "responses": [
      {
        "question": 2,
        "value": "Je pense que c'est la ville parfaite pour organiser les JO"
      },
      {
        "question": 13,
        "value": {
          "labels": ["Athlétisme"]
        }
      }
    ]
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Validation Failed",
    "errors": {
      "children": {
        "responses": {
          "children": [
            @...@,
            {
              "children": {
                "value": {
                  "errors": ["Vous devez sélectionner exactement 3 réponses."]
                },
                "question": []
              }
            }
          ]
        },
        "private": []
      }
    }
  }
  """

@security
Scenario: Logged in API client wants to add a reply with not enough choices for optional field with validation rules
  Given I am logged in to api as user
  When I send a POST request to "/api/questionnaires/questionnaire1/replies" with json:
  """
  {
    "responses": [
      {
        "question": 2,
        "value": "Je pense que c'est la ville parfaite pour organiser les JO"
      },
      {
        "question": 13,
        "value": {
          "labels": ["Athlétisme", "Natation", "Sports collectifs"]
        }
      },
      {
        "question": 16,
        "value": {
          "labels": ["Choix 1"]
        }
      }
    ]
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Validation Failed",
    "errors": {
      "children": {
        "responses": {
          "children": [
            @...@,
            {
              "children": {
                "value": {
                  "errors": ["Vous devez sélectionner au moins 2 réponses."]
                },
                "question": []
              }
            },
            @...@
          ]
        },
        "private": []
      }
    }
  }
  """

@security
Scenario: Logged in API client wants to add a reply to closed questionnaire step
  Given I am logged in to api as user
  And I send a POST request to "/api/questionnaires/questionnaire3/replies" with json:
  """
  {
    "responses": [
      {
        "question": 2,
        "value": "Je pense que c'est la ville parfaite pour organiser les JO"
      },
      {
        "question": 13,
        "value": {
          "labels": ["Athlétisme", "Natation", "Sports collectifs"]
        }
      }
    ]
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "You can no longer contribute to this questionnaire step.",
    "errors": @null@
  }
  """

@database
Scenario: Logged in API client wants to add another reply when multiple replies is allowed
  Given I am logged in to api as admin
  When I send a POST request to "/api/questionnaires/questionnaire1/replies" with json:
  """
  {
    "responses": [
      {
        "question": 2,
        "value": "Je pense que c'est la ville parfaite pour organiser les JO"
      },
      {
        "question": 13,
        "value": {
          "labels": ["Athlétisme", "Natation", "Sports collectifs"]
        }
      }
    ]
  }
  """
  Then the JSON response status code should be 201

@security
Scenario: Logged in API client wants to add another reply when multiple replies is not allowed
  Given I am logged in to api as admin
  Given I send a POST request to "/api/questionnaires/questionnaire2/replies" with json:
  """
  {
    "responses": [
      {
        "question": 2,
        "value": "Je pense que c'est la ville parfaite pour organiser les JO"
      },
      {
        "question": 13,
        "value": {
          "labels": ["Athlétisme", "Natation", "Sports collectifs"]
        }
      }
    ]
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Only one reply by user is allowed for this questionnaire.",
    "errors": @null@
  }
  """

@database @elasticsearch
Scenario: Logged in API client wants to remove a reply
  Given I am logged in to api as admin
  When I send a DELETE request to "api/questionnaires/questionnaire1/replies/2"
  Then the JSON response status code should be 204

@security
Scenario: Logged in API client wants to remove a reply when he is not the author
  Given I am logged in to api as user
  When I send a DELETE request to "api/questionnaires/questionnaire1/replies/2"
  Then the JSON response status code should be 403

@security
Scenario: Logged in API client wants to remove a reply in a closed questionnaire step
  Given I am logged in to api as admin
  And I send a DELETE request to "/api/questionnaires/questionnaire3/replies/3"
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "This reply is no longer deletable.",
    "errors": @null@
  }
  """
