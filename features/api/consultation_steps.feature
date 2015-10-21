Feature: Consultation Steps

## Create Opinion

  ### As an Anonymous

  @database @security
  Scenario: Anonymous API client wants to add a version
    When I send a POST request to "/api/consultations/1/steps/4/opinions"
    Then the JSON response status code should be 401
    And the JSON response should match:
    """
    {
      "code": 401,
      "message": "Invalid credentials"
    }
    """

  ### As a Logged in user

  @database
  Scenario: logged in API client wants to add an opinion
    Given I am logged in to api as user
    When I send a POST request to "/api/consultations/1/steps/4/opinions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "OpinionType": 16
    }
    """
    Then the JSON response status code should be 201

  @database
  Scenario: logged in API client wants to add a linked opinion
    Given I am logged in to api as user
    When I send a POST request to "/api/consultations/5/steps/5/opinions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "link": 60,
      "OpinionType": 9
    }
    """
    Then the JSON response status code should be 201

  @database @security
  Scenario: logged in API client wants to add an opinion to a not enabled opinionType
    Given I am logged in to api as user
    When I send a POST request to "/api/consultations/1/steps/4/opinions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "OpinionType": 1
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "This opinionType is not enabled.",
      "errors": @null@
    }
    """

  @database @security
  Scenario: logged in API client wants to add an opinion to an opinionType not available
    Given I am logged in to api as user
    When I send a POST request to "/api/consultations/1/steps/4/opinions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "OpinionType": 2
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "This opinionType is not available.",
      "errors": @null@
    }
    """
