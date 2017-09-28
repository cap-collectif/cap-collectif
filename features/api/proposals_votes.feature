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

@database @elasticsearch @security
Scenario: Logged in API client wants to vote for a proposal in a selection step with vote limited but has reached vote limit
  Given I am logged in to api as user
  When I send a POST request to "/api/selection_steps/selectionstep8/proposals/proposal18/votes" with json:
  """
  {}
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "You have reached the limit of votes.",
    "errors": null
  }
  """

@database @elasticsearch
Scenario: Logged in API client wants to vote and unvote for a proposal in a selection step
  Given I am logged in to api as user
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/proposal2/votes" with json:
  """
  {
  }
  """
  Then the JSON response status code should be 200
  And I send a DELETE request to "/api/selection_steps/selectionstep1/proposals/proposal2/votes"
  Then the JSON response status code should be 200

@database @elasticsearch
Scenario: Anonymous API client wants to vote for a proposal in a selection step
  Given feature "vote_without_account" is enabled
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/proposal2/votes" with json:
  """
  {
    "username": "test",
    "email": "test@test.com"
  }
  """
  Then the JSON response status code should be 200

@database @elasticsearch
Scenario: Anonymous API client wants to vote for a proposal in a selection step with vote_without_account feature disabled
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/proposal2/votes" with json:
  """
  {
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "You cannot vote without an account.",
    "errors": null
  }
  """

@security @elasticsearch
Scenario: Logged in API client wants to vote several times for a proposal in a selection step
  Given I am logged in to api as admin
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/proposal2/votes" with json:
  """
  {
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Validation Failed",
    "errors": {
      "errors": ["Vous avez déjà voté pour cette proposition."],
      "children": {
        "comment":[],
        "private":[]
      }
    }
  }
  """

@security @elasticsearch
Scenario: Anonymous API client wants to vote several times for a proposal in a selection step
  Given feature "vote_without_account" is enabled
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/proposal2/votes" with json:
  """
  {
    "username": "test",
    "email": "cheater@test.com"
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Validation Failed",
    "errors": {
      "children": {
        "username":[],
        "email": {
          "errors": ["Vous avez déjà voté pour cette proposition."]
        },
        "comment":[],
        "private":[]
      }
    }
  }
  """

@security @elasticsearch
Scenario: Anonymous API client wants to vote with an email associated to an account
  Given feature "vote_without_account" is enabled
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/proposal2/votes" with json:
  """
  {
    "username": "test",
    "email": "user@test.com"
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Validation Failed",
    "errors": {
      "children": {
        "username":[],
        "email": {
          "errors": ["Cette adresse électronique est déjà associée à un compte. Veuillez vous connecter pour soutenir cette proposition."]
        },
        "comment":[],
        "private":[]
      }
    }
  }
  """

@security @elasticsearch
Scenario: Logged in API client wants to delete a non-existing vote
  Given I am logged in to api as user
  When I send a DELETE request to "/api/selection_steps/selectionstep1/proposals/proposal2/votes"
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "You have not voted for this proposal in this selection step.",
    "errors": @null@
  }
  """

@security @elasticsearch
Scenario: Logged in API client wants to vote for a proposal in a wrong selection step
  Given I am logged in to api as user
  When I send a POST request to "/api/selection_steps/selectionstep1/proposals/proposal13/votes" with json:
  """
  {}
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "This proposal is not associated to this selection step.",
    "errors": @null@
  }
  """

@security @elasticsearch
Scenario: Logged in API client wants to vote for a proposal in a not votable selection step
  Given I am logged in to api as user
  When I send a POST request to "/api/selection_steps/selectionstep2/proposals/proposal2/votes" with json:
  """
  {
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "This selection step is not votable.",
    "errors": @null@
  }
  """

@security @elasticsearch
Scenario: Logged in API client wants to vote for a proposal in a closed selection step
  Given I am logged in to api as user
  When I send a POST request to "/api/selection_steps/selectionstep3/proposals/proposal11/votes" with json:
  """
  {
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "This selection step is no longer contributable.",
    "errors": @null@
  }
  """

@security @elasticsearch
Scenario: Logged in API client wants to vote when he has not enough credits left
  Given I am logged in to api as admin
  When I send a POST request to "/api/selection_steps/selectionstep4/proposals/proposal8/votes" with json:
  """
  {
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code":400,
    "message":"Validation Failed",
    "errors": {
      "errors": ["Vous n'avez pas suffisamment de cr\u00e9dits disponibles pour soutenir cette proposition."],
      "children":{"comment":[],"private":[]}
    }
  }
  """

@security @elasticsearch
Scenario: Anonymous API client wants to vote on a selection step that has budget vote
  Given feature "vote_without_account" is enabled
  When I send a POST request to "/api/selection_steps/selectionstep4/proposals/proposal8/votes" with json:
    """
    {
      "username": "bouh",
      "email": "voter@test.com"
    }
    """
  Then the JSON response status code should be 401
