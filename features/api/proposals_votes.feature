@proposals_votes
Feature: Proposal Votes Restful Api

@parallel-scenario
Scenario: Anonymous API client wants to get all votes for a proposal
  When I send a GET request to "/api/steps/selectionstep1/proposals/proposal2/votes"
  Then the JSON response status code should be 200
  And the JSON response should match:
  """
  {
    "votes": [
      {
        "user": @...@,
        "proposal": @...@,
        "selectionStep": @...@,
        "username": @string@,
        "private": @boolean@
      },
      @...@
    ],
    "count": @integer@
  }
  """
