Feature: ProposalForm Restful Api
  As an API client

  Scenario: Anonymous API client wants to get one proposal form
    When I send a GET request to "/api/proposal_forms/1"
    Then the JSON response should match:
"""
{
  "id": @integer@,
  "title": @string@,
  "description": @string@,
  "questions": @...@,
  "created_at": "@string@.isDateTime()",
  "updated_at": "@string@.isDateTime()",
  "isContribuable": @boolean@
}
"""
