@proposals
Feature: Proposal Restful Api

# Report
@database
Scenario: Anonymous API client wants to report a proposal
  When I send a POST request to "/api/proposals/proposal1/reports" with a valid report json
  Then the JSON response status code should be 403

@database @snapshot-email
Scenario: Logged in API client wants to report an proposal
  Given I am logged in to api as admin
  When I send a POST request to "/api/proposals/proposal1/reports" with a valid report json
  Then the JSON response status code should be 201
  Then I open mail with subject "reporting.notification.subject"
  And email should match snapshot "notifyReportingProposal.html"

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
