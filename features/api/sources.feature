@dev
Feature: Sources

## Vote

  ### As an Anonymous
  @database
  Scenario: Anonymous API client wants to add a vote
    When I send a POST request to "/api/sources/1/votes" with json:
    """
    {}
    """
    Then the JSON response status code should be 401

  ### As a Logged in user
  @database
  Scenario: logged in API client wants to add and delete a vote
    Given I am logged in to api as user
    When I send a POST request to "/api/sources/1/votes" with json:
    """
    {}
    """
    Then the JSON response status code should be 201
    When I send a DELETE request to "/api/sources/1/votes"
    Then the JSON response status code should be 204

  @database
  Scenario: logged in API client wants to delete a vote that doesn't exist
    Given I am logged in to api as user
    When I send a DELETE request to "/api/sources/1/votes"
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "You have not voted for this source.",
      "errors": @null@
    }
    """
