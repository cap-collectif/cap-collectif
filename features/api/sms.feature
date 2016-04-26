@sms
Feature: Sms

  @security
  Scenario: Anonymous API client wants to receive a confirmation sms
    When I send a POST request to "/api/send-sms-confirmation"
    Then the JSON response status code should be 404
    And the JSON response should match:
    """
    {
      "code":404,
      "message": "Cette fonction n'est pas activ\u00e9e, veuillez l'activer dans l'espace d'administration !",
      "errors": null
    }
    """

  @security
  Scenario: Anonymous API client wants to receive a confirmation sms
    Given features "registration" are enabled
    When I send a POST request to "/api/send-sms-confirmation"
    Then the JSON response status code should be 401
    And the JSON response should match:
    """
    {
      "code": 401,
      "message": "Invalid credentials"
    }
    """

  @security
  Scenario: Logged in API client without phone wants to receive a new confirmation sms
    Given features "registration" are enabled
    And I am logged in to api as user_without_phone
    When I send a POST request to "/api/send-sms-confirmation" with json:
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "No phone.",
      "errors": null
    }
    """

  @security
  Scenario: Logged in API client already sms confirmed wants to receive a new confirmation sms
    Given features "registration" are enabled
    And I am logged in to api as user
    When I send a POST request to "/api/send-sms-confirmation" with json:
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "Already confirmed.",
      "errors": null
    }
    """

  @database
  Scenario: Logged in API client non-sms confirmed wants to receive a confirmation sms
    Given features "registration" are enabled
    And I am logged in to api as user_not_sms_confirmed
    When I send a POST request to "/api/send-sms-confirmation" with json:
    Then the JSON response status code should be 201
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "Already confirmed.",
      "errors": null
    }
    """
