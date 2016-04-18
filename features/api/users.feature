@users
Feature: Users

  @parallel-scenario
  Scenario: API client wants to know the number of users
    When I send a GET request to "/api/users"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """

  @parallel-scenario
  Scenario: API client wants to know the number of citoyens
    When I send a GET request to "/api/users?type=citoyen"
    Then the JSON response should match:
    """
    {
      "count": "@integer@.greaterThan(0)"
    }
    """

  @parallel-scenario
  Scenario: API client wants to know the number of citoyens who registered since 2011-11-23
    When I send a GET request to "/api/users?type=citoyen&from=2016-11-23T00:00:00"
    Then the JSON response should match:
    """
    {
      "count": 0
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
    {"code":404,"message":"Cette fonction n'est pas activ\u00e9e, veuillez l'activer dans l'espace d'administration !","errors":null}
    """

  # Note: captcha validation is disabled in test environement
  @database
  Scenario: Anonymous API client wants to register
    Given feature "registration" is enabled
    When I send a POST request to "/api/users" with json:
    """
    {
      "username": "user2",
      "email": "user2@test.com",
      "plainPassword": "supersecureuserpass",
      "captcha": "fakekey"
    }
    """
    Then the JSON response status code should be 201

    @security
    Scenario: Anonymous API client wants to register but data not allowed
      Given feature "registration" is enabled
      When I send a POST request to "/api/users" with json:
      """
      {
        "username": "user2",
        "email": "user2@test.com",
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
        "message": "Validation Failed",
        "errors": {
          "errors": ["Ce formulaire ne doit pas contenir des champs suppl\u00e9mentaires."],
          "children":{
            "username":[],
            "email":[],
            "plainPassword":[],
            "captcha":[]
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
        "email": "user2@test.com",
        "plainPassword": "supersecureuserpass",
        "captcha": "fakekey",
        "userType": 1,
        "zipcode": "99999"
      }
      """
      Then the JSON response status code should be 201
