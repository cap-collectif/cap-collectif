@proposal_forms
Feature: ProposalForm Restful Api
  As an API client

  @parallel-scenario
  Scenario: Anonymous API client wants to get one proposal form
    When I send a GET request to "/api/proposal_forms/1"
    Then the JSON response should match:
"""
{
  "id": @integer@,
  "title": @string@,
  "titleHelpText": @string@,
  "description": @string@,
  "descriptionHelpText": @string@,
  "themeHelpText": @string@,
  "districtHelpText": @string@,
  "categoryHelpText": @string@,
  "isContribuable": true,
  "usingThemes": @boolean@,
  "fields": [
    {
      "id": @integer@,
      "type": @string@,
      "helpText": @string@,
      "required": @...@,
      "question": @string@,
      "slug": @string@
    },
    {
      "id": @integer@,
      "type": @string@,
      "helpText": @string@,
      "required": true,
      "question": @string@,
      "slug": @string@
    }
  ]
}
"""
