Feature: Selection steps

  Scenario: Anonymous API client wants to get all proposals from a selection step
    When I send a GET request to "/api/selection_steps/6/proposals?order=favorable&offset=1"
    Then the JSON response should match:
  """
  {
    "proposals": [
      {
        "id": @integer@,
        "body": @string@,
        "updated_at": "@string@.isDateTime()",
        "theme": @...@,
        "district": @...@,
        "status": @...@,
        "author": @...@,
        "comments": @array@,
        "responses": @array@,
        "comments_count": @integer@,
        "created_at": "@string@.isDateTime()",
        "title": @string@,
        "answer": @null@,
        "_links": @...@
      }
    ],
    "count": 3
  }
  """

  Scenario: Anonymous API client wants to get all proposals in a theme from a selection step
    When I send a GET request to "/api/selection_steps/6/proposals?theme=1"
    Then the JSON response should match:
  """
  {
    "proposals": [
      {
        "id": @integer@,
        "body": @string@,
        "updated_at": "@string@.isDateTime()",
        "theme": @...@,
        "district": @...@,
        "status": @...@,
        "author": @...@,
        "comments": @array@,
        "responses": @array@,
        "comments_count": @integer@,
        "created_at": "@string@.isDateTime()",
        "title": @string@,
        "answer": @null@,
        "_links": @...@
      }
    ],
    "count": 1
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
