Feature: Consultation Steps

## Create Opinion

  ### As an Anonymous

  @database
  Scenario: Anonymous API client wants to add a version
    When I send a POST request to "/api/consultations/1/steps/4/opinions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "comment": "Un peu de fun dans ce monde trop sobre !"
    }
    """
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
  Scenario: logged in API client wants to add a version
    Given I am logged in to api as user
    When I send a POST request to "/api/consultations/1/steps/4/opinions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "comment": "Un peu de fun dans ce monde trop sobre !"
    }
    """
    Then the JSON response status code should be 201

  @database
  Scenario: logged in API client wants to add a version to an uncontributable opinion
    Given I am logged in to api as user
    When I send a POST request to "/api/consultations/1/steps/4/opinions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "comment": "Un peu de fun dans ce monde trop sobre !"
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "Can't add a version to an uncontributable opinion.",
      "errors": @null@
    }
    """
