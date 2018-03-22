@comments
Feature: Comments

@parallel-scenario
Scenario: API client wants to know the number of comments
  When I send a GET request to "/api/comments"
  Then the JSON response should match:
  """
  {
    "count": "@integer@.greaterThan(0)"
  }
  """

@security
Scenario: Anonymous API client wants to report a idea
  When I send a POST request to "/api/comments/ideaComment1/reports" with a valid report json
  Then the JSON response status code should be 401

@database
Scenario: Logged in API client wants to report an idea
  Given I am logged in to api as admin
  When I send a POST request to "/api/comments/ideaComment1/reports" with a valid report json
  Then the JSON response status code should be 201
