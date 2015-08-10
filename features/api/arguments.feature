@dev
Feature: Arguments

## Vote

  ### As an Anonymous

  @database
  Scenario: Anonymous API client wants to add a version
    When I send a POST request to "/api/arguments/57/votes" with json:
    """
    {}
    """
    Then the JSON response status code should be 401

  ### As a Logged in user
  @database
  Scenario: logged in API client wants to add a version vote
    Given I am logged in to api as user
    When I send a POST request to "/api/arguments/57/votes" with json:
    """
    {}
    """
    Then the JSON response status code should be 201

  @database
  Scenario: logged in API client wants to delete a vote
    Given I am logged in to api as user
    When I send a DELETE request to "/api/arguments/57/votes/1"
    Then the JSON response status code should be 200


