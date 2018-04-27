@proposals
Feature: Proposal Restful Api

@database
Scenario: logged in API client wants to remove a proposal
  Given I am logged in to api as user
  When I send a DELETE request to "api/proposal_forms/proposalForm1/proposals/proposal2"
  Then the JSON response status code should be 204

@database
Scenario: logged in API client wants to remove a proposal and ensure that its proposal was disabled
  Given I am logged in to api as user
  When I send a DELETE request to "api/proposal_forms/proposalForm4/proposals/proposal12"
  Then the JSON response status code should be 204
  And proposal with id "proposal12" should be deleted

# Report
@database
Scenario: Anonymous API client wants to report a proposal
  When I send a POST request to "/api/proposals/proposal1/reports" with a valid report json
  Then the JSON response status code should be 401

@database
Scenario: Logged in API client wants to report an proposal
  Given I am logged in to api as admin
  When I send a POST request to "/api/proposals/proposal1/reports" with a valid report json
  Then the JSON response status code should be 201

# Selections
Scenario: Anonymous API client wants to get selections of a proposal
  When I send a GET request to "/api/proposals/proposal1/selections"
  Then the JSON response should match:
  """
    [
      {
        "step": {
          "id": "selectionStep6",
          "statuses": @...@
        },
        "status": {
          "color": @string@,
          "name": "Soumis au vote",
          "id": "status4"
        }
      }
    ]
  """
