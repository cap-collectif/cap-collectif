Feature: Selection steps

  @elasticsearch
  Scenario: Anonymous API client wants to get all proposals from a selection step
    When I send a POST request to "/api/selection_steps/6/proposals/search?order=last" with json:
      """
      {
      }
      """
    Then the JSON response should match:
    """
    {
      "proposals": [
        {
          "id": @integer@,
          "body": @string@,
          "updated_at": "@string@.isDateTime()",
          "theme": {
            "id": @integer@,
            "title": @string@,
            "_links": @...@
          },
          "district": {
            "id": @integer@,
            "name": @string@
          },
          "status": {
            "id": @integer@,
            "name": @string@,
            "color": @string@
          },
          "author": @...@,
          "proposalForm": {
            "id": @integer@
          },
          "comments": @...@,
          "responses": @...@,
          "selectionSteps": @...@,
          "comments_count": @integer@,
          "created_at": "@string@.isDateTime()",
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "hasUserReported": @boolean@,
          "_links": @...@
        },
        @...@
      ],
      "count": 3
    }
    """

  @elasticsearch
  Scenario: Anonymous API client wants to get all proposals in a theme from a selection step filtered by theme
    When I send a POST request to "/api/selection_steps/6/proposals/search" with json:
    """
      {
        "filters": {
          "theme": 2
        }
      }
      """
    Then the JSON response should match:
    """
    {
      "proposals": [
        {
          "id": @integer@,
          "body": @string@,
          "updated_at": "@string@.isDateTime()",
          "theme": {
            "id": @integer@,
            "title": @string@,
            "_links": @...@
          },
          "district": {
            "id": @integer@,
            "name": @string@
          },
          "status": {
            "id": @integer@,
            "name": @string@,
            "color": @string@
          },
          "author": @...@,
          "proposalForm": {
            "id": @integer@
          },
          "comments": @...@,
          "responses": @...@,
          "selectionSteps": @...@,
          "comments_count": @integer@,
          "created_at": "@string@.isDateTime()",
          "enabled": @boolean@,
          "isTrashed": @boolean@,
          "title": @string@,
          "hasUserReported": @boolean@,
          "_links": @...@
        },
        @...@
      ],
      "count": 2
    }
    """

#  @database
#  Scenario: logged in API client wants to vote for a proposal in a selection step
#    Given I am logged in to api as user
#    When I send a POST request to "/api/selection_steps/6/proposals/1/vote"
#    Then the JSON response status code should be 201

#  @database
#  Scenario: logged in API client wants to remove a vote on a proposal for a selection step
#    Given I am logged in to api as user
#    When I send a DELETE request to "/api/selection_steps/6/proposals/1/vote"
#    Then the JSON response status code should be 204
