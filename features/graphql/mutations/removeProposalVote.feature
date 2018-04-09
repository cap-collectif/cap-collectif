#
# @security @elasticsearch
# Scenario: Logged in API client wants to delete a non-existing vote
#   Given I am logged in to api as user
#   When I send a DELETE request to "/api/selection_steps/selectionstep1/proposals/proposal2/votes"
#   Then the JSON response status code should be 400
#   And the JSON response should match:
#   """
#   {
#     "code": 400,
#     "message": "You have not voted for this proposal in this selection step.",
#     "errors": @null@
#   }
#   """
