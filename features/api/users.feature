@users
Feature: Users

@parallel-scenario
Scenario: API client wants to know the number of users
  Given I am logged in to api as admin
  When I send a GET request to "/api/users"
  Then the JSON response should match:
  """
  {
    "count": "@integer@.greaterThan(0)",
    "users": @...@
  }
  """

@parallel-scenario
Scenario: API client wants to know the number of citoyens
  Given I am logged in to api as admin
  When I send a GET request to "/api/users?type=citoyen"
  Then the JSON response should match:
  """
  {
    "count": "@integer@.greaterThan(0)",
    "users": @...@
  }
  """

@parallel-scenario
Scenario: API client wants to know the number of citoyens who registered since 2020-11-23
  When I send a GET request to "/api/users?type=citoyen&from=2020-11-23T00:00:00"
  Then the JSON response should match:
  """
  {
    "count": 0,
    "users": []
  }
  """

@parallel-scenario
Scenario: API client wants to know the number of citoyens who have email aurelien@cap-collectif.com
  Given I am logged in to api as admin
  When I send a GET request to "/api/users?email=aurelien@cap-collectif.com"
  Then the JSON response should match:
  """
  {
    "count": 1,
    "users": [{
      "id": @string@,
      "_links": {
        "settings": @string@
      }
    }]
  }
  """

@security
Scenario: Anonymous API client wants to register but registration is not enabled
  When I send a POST request to "/api/users" with json:
  """
  {
    "username": "user2",
    "email": "user2@test.com",
    "plainPassword": "supersecureuserpass"
  }
  """
  Then the JSON response status code should be 404
  And the JSON response should match:
  """
  {"code":404,"message":"error.feature_not_enabled"}
  """

# Note: captcha validation is disabled in test environement
@database
Scenario: Anonymous API client wants to register
  Given feature "registration" is enabled
  When I send a POST request to "/api/users" with json:
  """
  {
    "username": "user2",
    "email": "user2@gmail.com",
    "plainPassword": "supersecureuserpass",
    "captcha": "fakekey",
    "responses": [
      {
        "question": 6,
        "value": "Réponse à la question obligatoire"
      },
      {
        "question": 17,
        "value": "Sangohan"
      }
    ]
  }
  """
  Then the JSON response status code should be 201

@security
Scenario: Anonymous API client wants to register with throwable email
  Given feature "registration" is enabled
  When I send a POST request to "/api/users" with json:
  """
  {
    "username": "user2",
    "email": "user2@yopmail.com",
    "plainPassword": "supersecureuserpass",
    "captcha": "blabla"
  }
  """
  Then the JSON response status code should be 400
  Then the JSON response should match:
  """
  {
    "code": 400,
    "message":"Validation Failed",
    "errors":{
      "children":{
        "username":[],
        "email":{
          "errors": ["email.throwable"]
        },
        "plainPassword":[],
        "captcha":[],
        "consentExternalCommunication":[],
        "responses": []
      }
    }
  }
  """

@security @database
Scenario: Anonymous API client wants to register with unknown additional data
  Given feature "registration" is enabled
  When I send a POST request to "/api/users" with json:
  """
  {
    "username": "user2",
    "email": "user2@gmail.com",
    "plainPassword": "supersecureuserpass",
    "captcha": "fakekey",
    "userType": 1,
    "zipcode": "99999"
  }
  """
  Then the JSON response status code should be 400
  Then the JSON response should match:
  """
  {
     "code":400,
     "message":"Validation Failed",
     "errors":{
        "errors":[
           "This form should not contain extra fields. {\"{{ extra_fields }}\":\"\\\"userType\\\", \\\"zipcode\\\"\"}"
        ],
        "children":{
           "plainPassword":[],
           "username":[],
           "email":[],
           "captcha":[],
           "consentExternalCommunication":[],
           "responses":[]
        }
     }
  }
  """

@database
Scenario: Anonymous API client wants to register with zipcode and type
  Given features "registration", "user_type", "zipcode_at_register" are enabled
  When I send a POST request to "/api/users" with json:
  """
  {
    "username": "user2",
    "email": "user2@gmail.com",
    "plainPassword": "supersecureuserpass",
    "captcha": "fakekey",
    "userType": 1,
    "zipcode": "99999",
    "responses": [
      {
        "question": 6,
        "value": "Réponse à la question obligatoire"
      },
      {
        "question": 17,
        "value": "Sangohan"
      }
    ]
  }
  """
  Then the JSON response status code should be 201

@database
Scenario: Admin API client can register an other admin
  Given feature "registration" is enabled
  And I am logged in to api as admin
  When I send a POST request to "/api/users" with json:
  """
  {
    "username": "admin2",
    "email": "admin2@test.com",
    "roles": ["ROLE_ADMIN"]
  }
  """
  Then the JSON response status code should be 201
  Then the JSON response should match:
  """
  {
    "id": @string@,
    "_links": @...@
  }
  """
  And I wait 2 seconds
  And 1 mail should be sent
  And I open mail with subject 'email-subject-confirm-admin-account {"{sitename}":"Cap-Collectif"}'
  Then I should see 'email-content-confirm-admin-account' in mail

@security
Scenario: API client wants to update his phone
  When I send a PUT request to "/api/users/me" with json:
  """
  {
    "phone": "+33628353290"
  }
  """
  Then the JSON response status code should be 401
  Then the JSON response should match:
  """
  {"code":401,"message":"Bad credentials"}
  """

@database
Scenario: API client wants to update his phone
  Given I am logged in to api as user
  When I send a PUT request to "/api/users/me" with json:
  """
  {
    "phone": "+33628353290"
  }
  """
  Then the JSON response status code should be 204
  And "user" phone number should be "+33628353290"
  And "user" should not be sms confirmed

@security
Scenario: API client wants to update his phone
  Given I am logged in to api as user
  When I send a PUT request to "/api/users/me" with json:
  """
  {
    "phone": "+33"
  }
  """
  Then the JSON response status code should be 400
  Then the JSON response should match:
  """
  {
    "code":400,
    "message": "Validation Failed",
    "errors": {
      "children": {
        "phone": {
          "errors": [
            "This value is not a valid phone number. {\"{{ type }}\":\"any\",\"{{ value }}\":\"\\\"+33\\\"\"}"
          ]
        }
      }
    }
  }
  """

@database
Scenario: API client wants to update his email
  Given I am logged in to api as user
  When I send a PUT request to "/api/users/me" with json:
  """
  {
    "email": "popopopopo@gmail.com",
    "password": "user"
  }
  """
  Then the JSON response status code should be 204
  And user "user" email_to_confirm should be "popopopopo@gmail.com"

@database
Scenario: API client wants to update his email and the domain email is restricted
  Given I am logged in to api as user
  Given feature "restrict_registration_via_email_domain" is enabled
  When I send a PUT request to "/api/users/me" with json:
  """
  {
    "email": "popopopopo@gmail.com",
    "password": "user"
  }
  """
  Then the JSON response status code should be 400
  Then the JSON response should match:
  """
  {
    "message": "Unauthorized email domain."
  }
  """
