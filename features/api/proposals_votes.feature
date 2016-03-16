@proposals_votes
Feature: Proposal Votes Restful Api
  As an API client

  @parallel-scenario
  Scenario: Anonymous API client wants to get all votes for a proposal
    When I send a GET request to "/api/proposal_forms/1/proposals/2/votes"
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

  @parallel-scenario
  Scenario: Logged in API client wants to get all votable steps with votes
    Given I am logged in to api as admin
    When I send a GET request to "/api/projects/7/votable_steps"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "votableSteps": [
        {
          "projectId": @integer@,
          "position": @integer@,
          "id": @integer@,
          "isOpen": @boolean@,
          "title": @string@,
          "enabled": @boolean@,
          "startAt": "@string@.isDateTime()",
          "endAt": "@string@.isDateTime()",
          "voteType": @integer@,
          "votesHelpText": @string@,
          "budget": @...@,
          "creditsLeft": @number@,
          "body": @string@,
          "userVotesCount": @integer@,
          "userVotes": [
            {
              "proposal": @...@,
              "selectionStep": @...@,
              "private": @boolean@
            },
            @...@
          ]
        },
        @...@
      ]
    }
    """

  @database
  Scenario: Logged in API client wants to vote and unvote for a proposal in a selection step
    Given I am logged in to api as user
    When I send a POST request to "/api/selection_steps/6/proposals/2/votes" with json:
    """
    {
    }
    """
    Then the JSON response status code should be 201
    And I send a DELETE request to "/api/selection_steps/6/proposals/2/votes"
    Then the JSON response status code should be 204

  @database
  Scenario: Anonymous API client wants to vote for a proposal in a selection step
    When I send a POST request to "/api/selection_steps/6/proposals/2/votes" with json:
    """
    {
      "username": "test",
      "email": "test@test.com"
    }
    """
    Then the JSON response status code should be 201

  @security
  Scenario: Logged in API client wants to vote several times for a proposal in a selection step
    Given I am logged in to api as admin
    When I send a POST request to "/api/selection_steps/6/proposals/2/votes" with json:
    """
    {
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "form": @...@,
      "errors":[
        "Vous avez déjà voté pour cette proposition."
      ]
    }
    """

  @security
  Scenario: Anonymous API client wants to vote several times for a proposal in a selection step
    When I send a POST request to "/api/selection_steps/6/proposals/2/votes" with json:
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
      "form": @...@,
      "errors":[
        "Vous avez déjà voté pour cette proposition."
      ]
    }
    """

  @security
  Scenario: Anonymous API client wants to vote with an email associated to an account
    When I send a POST request to "/api/selection_steps/6/proposals/2/votes" with json:
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
      "form": @...@,
      "errors":[
        "Cette adresse électronique est déjà associée à un compte. Veuillez vous connecter pour soutenir cette proposition."
      ]
    }
    """

  @security
  Scenario: Logged in API client wants to delete a non-existing vote
    Given I am logged in to api as user
    When I send a DELETE request to "/api/selection_steps/6/proposals/2/votes"
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "You have not voted for this proposal in this selection step.",
      "errors": @null@
    }
    """

  @security
  Scenario: Logged in API client wants to vote for a proposal in a wrong selection step
    Given I am logged in to api as user
    When I send a POST request to "/api/selection_steps/6/proposals/3/votes" with json:
    """
    {
    }
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

  @security
  Scenario: Logged in API client wants to vote for a proposal in a not votable selection step
    Given I am logged in to api as user
    When I send a POST request to "/api/selection_steps/7/proposals/2/votes" with json:
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

  @security
  Scenario: Logged in API client wants to vote for a proposal in a closed selection step
    Given I am logged in to api as user
    When I send a POST request to "/api/selection_steps/8/proposals/11/votes" with json:
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

    @security
    Scenario: Logged in API client wants to vote when he has not enough credits left
      Given I am logged in to api as admin
      When I send a POST request to "/api/selection_steps/9/proposals/8/votes" with json:
      """
      {
      }
      """
      Then the JSON response status code should be 400
      And the JSON response should match:
      """
      {
        "form": @...@,
        "errors":[
          "Vous n'avez pas suffisamment de crédits disponibles pour soutenir cette proposition."
        ]
      }
      """

  @security
  Scenario: Anonymous API client wants to vote on a selection step that has budget vote
    When I send a POST request to "/api/selection_steps/9/proposals/8/votes" with json:
      """
      {
        "username": "bouh",
        "email": "voter@test.com"
      }
      """
    Then the JSON response status code should be 401
