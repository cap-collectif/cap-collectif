@proposals_comments
Feature: Proposals comments

@parallel-scenario
Scenario: API client wants to list comments of a proposal
  When I send a GET request to "/api/proposal_forms/proposalForm1/proposals/proposal1/comments"
  Then the JSON response should match:
  """
  {
    "comments_and_answers_count": @integer@,
    "comments_count": @integer@,
    "comments":
    [
      {
        "can_contribute": @boolean@,
        "id": @integer@,
        "body": @string@,
        "created_at": "@string@.isDateTime()",
        "updated_at": "@string@.isDateTime()",
        "votes_count": @integer@,
        "author": {
          "username": @string@,
          "displayName": @string@,
          "isAdmin": @boolean@,
          "uniqueId": @string@,
          "media": @...@,
          "_links": {
            "profile": @string@,
            "settings": @string@
          }
        },
        "answers": @...@,
        "author_email": @null@,
        "author_name": @null@,
        "is_trashed": @boolean@,
        "_links": {
          "vote": @string@,
          "edit": @string@
        },
        "has_user_reported": @boolean@,
        "has_user_voted": @boolean@,
        "can_edit": @boolean@
      },
      @...@
    ]
  }
  """

@parallel-scenario
Scenario: API client wants to find the first comment of a proposal
  When I send a GET request to "/api/proposal_forms/proposalForm1/proposals/proposal1/comments?limit=1"
  Then the JSON response should match:
  """
  {
    "comments_and_answers_count": @integer@,
    "comments_count": @integer@,
    "comments":
    [
      {
        "can_contribute": @boolean@,
        "id": @integer@,
        "body": @string@,
        "created_at": "@string@.isDateTime()",
        "updated_at": "@string@.isDateTime()",
        "votes_count": @integer@,
        "author": @...@,
        "answers": @...@,
        "author_email": @null@,
        "author_name": @null@,
        "is_trashed": @boolean@,
        "_links": @...@,
        "has_user_reported": @boolean@,
        "has_user_voted": @boolean@,
        "can_edit": @boolean@
      }
    ]
  }
  """

@parallel-scenario
Scenario: API client wants to find popular comments of a proposal
  When I send a GET request to "/api/proposal_forms/proposalForm1/proposals/proposal1/comments?filter=popular"
  Then the JSON response should match:
  """
  {
    "comments_and_answers_count": "@integer@.greaterThan(3)",
    "comments_count": "@integer@.greaterThan(3)",
    "comments":
    [
      @...@
    ]
  }
  """
  And the comments should be ordered by popularity

@database
Scenario: Anonymous API client wants to add a comment
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals/proposal1/comments" with json:
  """
  {
    "authorName": "Kéké",
    "authorEmail": "vivele94@gmail.com",
    "body": "Vive moi qui suis plus fort que www.google.fr !"
  }
  """
  Then the JSON response status code should be 201

@database
Scenario: Anonymous API client wants to add an answer to a comment
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals/proposal1/comments" with json:
  """
  {
    "parent": 154,
    "authorName": "Kéké",
    "authorEmail": "vivele94@gmail.com",
    "body": "Ma super réponse"
  }
  """
  Then the JSON response status code should be 201

@security
Scenario: Anonymous API client wants to add a comment without user informations
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals/proposal1/comments" with json:
  """
  {
    "body": "Vive moi qui suis plus fort que www.google.fr !"
  }
  """
  Then the JSON response status code should be 400

@database
Scenario: logged in API client wants to add a comment
  Given I am logged in to api as user
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals/proposal1/comments" with json:
  """
  {
    "body": "Vive moi user ! Réponds à ça si tu l'oses."
  }
  """
  Then the JSON response status code should be 201

@database
Scenario: logged in API client wants to add an answer to a comment
  Given I am logged in to api as user
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals/proposal1/comments" with json:
  """
  {
    "parent": 154,
    "body": "Oh oui j'ose :-P"
  }
  """
  Then the JSON response status code should be 201

@security
Scenario: logged in API client wants to add a comment by hacking
  Given I am logged in to api as user
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals/proposal1/comments" with json:
  """
  {
    "parent": 1,
    "body": "Pr0 Hacker"
  }
  """
  Then the JSON response status code should be 404
  And the JSON response should match:
  """
  {
    "code": 404,
    "message": "This parent comment is not linked to this proposal",
    "errors": @null@
  }
  """

@security
Scenario: logged in API client wants to add a comment to the wrong proposal
  Given I am logged in to api as user
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals/proposal1/comments" with json:
  """
  {
    "parent": 1,
    "body": "Pr0 Hacker"
  }
  """
  Then the JSON response status code should be 404
  And the JSON response should match:
  """
  {
    "code": 404,
    "message": "This parent comment is not linked to this proposal",
    "errors": @null@
  }
  """

@security
Scenario: logged in API client wants to add an answer to an answer
  Given I am logged in to api as user
  When I send a POST request to "/api/proposal_forms/proposalForm1/proposals/proposal1/comments" with json:
  """
  {
    "parent": 158,
    "body": "Pr0 Hacker"
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "You can't answer the answer of a comment.",
    "errors": @null@
  }
  """
