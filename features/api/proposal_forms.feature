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
  "titleHelpText": @...@,
  "descriptionHelpText": @...@,
  "themeHelpText": @...@,
  "districtHelpText": @...@,
  "isContribuable": true,
  "questions": [
    {
      "id": @integer@,
      "inputType": "text",
      "helpText": @string@,
      "required": false,
      "title": @string@
    },
    {
      "id": @integer@,
      "inputType": "textarea",
      "helpText": @string@,
      "required": true,
      "title": @string@
    }
  ]
}
"""
