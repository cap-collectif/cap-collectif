Feature: Arguments

## List

  @parallel-scenario
  Scenario: API client wants to list arguments of an opinion
    When I send a GET request to "/api/opinions/2/arguments"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "arguments": [
        {
          "id": @integer@,
          "body": @string@,
          "type": @integer@,
          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",

          "votes_count": @integer@,
          "is_trashed": @boolean@,
          "is_enabled": @boolean@,
          "isContribuable": @boolean@,

          "author": {
            "username": @string@,
            "displayName": @string@,
            "uniqueId": @string@,
            "isAdmin": @boolean@,
            "vip": @boolean@,
            "media": @...@,
            "_links": {
              "profile": @string@,
              "settings": @string@
            }
          },
          "_links": {
            "show": @string@,
            "edit": @string@,
            "report": @string@
          },
          "has_user_voted": @boolean@,
          "has_user_reported": @boolean@
        },
        @...@
      ]
    }
    """

  @parallel-scenario
  Scenario: API client wants to list arguments of an opinion version
    When I send a GET request to "/api/versions/1/arguments"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "arguments": [
        {
          "id": @integer@,
          "body": @string@,
          "type": @integer@,
          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",

          "votes_count": @integer@,
          "is_trashed": @boolean@,
          "is_enabled": @boolean@,
          "isContribuable": @boolean@,

          "author": {
            "username": @string@,
            "displayName": @string@,
            "uniqueId": @string@,
            "isAdmin": @boolean@,
            "vip": @boolean@,
            "media": @...@,
            "_links": {
              "profile": @string@,
              "settings": @string@
            }
          },
          "_links": {
            "show": @string@,
            "edit": @string@,
            "report": @string@
          },
          "has_user_voted": @boolean@,
          "has_user_reported": @boolean@
        },
        @...@
      ]
    }
    """

## Vote

  ### As an Anonymous

  @parallel-scenario
  Scenario: Anonymous API client wants to vote for an argument
    When I send a POST request to "/api/arguments/1/votes" with json:
    """
    {}
    """
    Then the JSON response status code should be 401

  ### As a Logged in user
  @database
  Scenario: logged in API client wants to vote for an argument then delete the vote
    Given I am logged in to api as user
    When I send a POST request to "/api/arguments/1/votes" with json:
    """
    {}
    """
    Then the JSON response status code should be 201
    When I send a DELETE request to "/api/arguments/1/votes"
    Then the JSON response status code should be 204

  @database
  Scenario: logged in API client wants to delete a non-existent vote
    Given I am logged in to api as user
    When I send a DELETE request to "/api/arguments/2/votes"
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "You have not voted for this argument.",
      "errors": @null@
    }
    """

