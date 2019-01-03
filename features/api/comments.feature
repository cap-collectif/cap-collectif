@comments
Feature: Comments

@security
Scenario: Anonymous API client wants to report a idea
  When I send a POST request to "/api/comments/proposalComment1/reports" with a valid report json
  Then the JSON response status code should be 403

@database
Scenario: Logged in API client wants to report an idea
  Given I am logged in to api as admin
  When I send a POST request to "/api/comments/proposalComment1/reports" with a valid report json
  Then the JSON response status code should be 201
