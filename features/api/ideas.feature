@ideas
Feature: Ideas

  Background:
    Given feature "ideas" is enabled

## List

  @parallel-scenario
  Scenario: API client wants to list ideas
    When I send a POST request to "/api/ideas/search" with json:
    """
    {
    }
    """
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "ideas": [
        {
          "id": @integer@,
          "title": @string@,
          "slug": @string@,
          "body": @string@,
          "object": @string@,
          "url": @...@,
          "createdAt": "@string@.isDateTime()",
          "updatedAt": "@string@.isDateTime()",
          "votesCount": @integer@,
          "trashed": @boolean@,
          "enabled": @boolean@,
          "theme": @...@,
          "canContribute": @boolean@,
          "author": {
            "username": @string@,
            "displayName": @string@,
            "uniqueId": @string@,
            "isAdmin": @boolean@,
            "vip": @boolean@,
            "media": {
              "url": @string@
            },
            "_links": {
              "profile": @string@,
              "settings": @string@
            }
          },
          "_links": {
            "show": @string@
          }
        },
        @...@
      ],
      "count": 10,
      "countTrashed": 12
    }
    """

## CRUD

  ## Get

  @parallel-scenario
  Scenario: API client wants to get an idea
    When I send a GET request to "/api/ideas/1"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "idea": {
        "id": @integer@,
        "title": @string@,
        "slug": @string@,
        "body": @string@,
        "object": @string@,
        "url": @...@,
        "createdAt": "@string@.isDateTime()",
        "updatedAt": "@string@.isDateTime()",
        "votesCount": @integer@,
        "trashed": @boolean@,
        "enabled": @boolean@,
        "theme": @...@,
        "canContribute": @boolean@,
        "author": {
          "username": @string@,
          "displayName": @string@,
          "uniqueId": @string@,
          "isAdmin": @boolean@,
          "vip": @boolean@,
          "media": {
            "url": @string@
          },
          "_links": {
            "profile": @string@,
            "settings": @string@
          }
        },
        "_links": {
          "show": @string@
        }
      }
    }
    """

  ## Create

  @security
  Scenario: Anonymous API client wants to create an idea
    Given feature "idea_creation" is enabled
    When I send a POST request to "/api/ideas" with a valid idea json
    Then the JSON response status code should be 401

  @database
  Scenario: Logged in API client wants to create an idea
    Given feature "idea_creation" is enabled
    And I am logged in to api as user
    When I send a POST request to "/api/ideas" with a valid idea json
    Then the JSON response status code should be 201

  @security
  Scenario: Logged in API client wants to create an idea when idea creation is disabled
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas" with a valid idea json
    Then the JSON response status code should be 404
    And the JSON response should match:
    """
    {
      "code": 404,
      "message": "error.feature_not_enabled",
      "errors": @null@
    }
    """

  ## Update

  @security
  Scenario: Anonymous API client can't update an idea
    When I send a POST request to "/api/ideas/2" with a valid idea update json
    Then the JSON response status code should be 401

  @security
  Scenario: Logged in API client can't update an idea when not the author
    Given I am logged in to api as admin
    When I send a POST request to "/api/ideas/2" with a valid idea update json
    Then the JSON response status code should be 403

  @database
  Scenario: Logged in API client can update his idea
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/2" with a valid idea update json
    Then the JSON response status code should be 200

  ## Delete

  @security
  Scenario: Anonymous API client wants to delete a idea
    When I send a DELETE request to "/api/ideas/2"
    Then the JSON response status code should be 401

  @security
  Scenario: Logged in API client wants to delete an idea but is not the author
    Given I am logged in to api as admin
    When I send a DELETE request to "/api/ideas/2"
    Then the JSON response status code should be 403

  @database
  Scenario: Logged in API client wants to delete his idea
    Given I am logged in to api as user
    When I send a DELETE request to "/api/ideas/2"
    Then the JSON response status code should be 204

## Vote

  @database
  Scenario: Logged in API client wants to vote and unvote for an idea
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/2/votes" with json:
    """
    {}
    """
    Then the JSON response status code should be 201
    And the JSON response should match:
    """
    {
      "user": @...@,
      "private": false,
      "username": ""
    }
    """
    And I send a DELETE request to "/api/ideas/2/votes"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "user": @...@,
      "private": false,
      "username": ""
    }
    """

  @database
  Scenario: Logged in API client wants to vote for an idea anonymously
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/2/votes" with json:
    """
    {
      "private": true
    }
    """
    Then the JSON response status code should be 201

  @database
  Scenario: Logged in API client wants to vote for an idea with a comment
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/2/votes" with json:
    """
    {
      "comment": "Je suis un commentaire"
    }
    """
    Then the JSON response status code should be 201

  @security
  Scenario: Logged in API client wants to vote for an idea with a comment and anonymously
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/2/votes" with json:
    """
    {
      "comment": "Je suis un commentaire",
      "private": true
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
       "message": "You can not add a comment when voting anonymously.",
       "errors": @null@
    }
    """

  @database
  Scenario: Anonymous API client wants to vote for an idea
    When I send a POST request to "/api/ideas/2/votes" with json:
    """
    {
      "username": "test",
      "email": "test@test.com"
    }
    """
    Then the JSON response status code should be 201

  @database
  Scenario: Anonymous API client wants to vote for an idea anonymously
    When I send a POST request to "/api/ideas/2/votes" with json:
    """
    {
      "username": "test",
      "email": "test@test.com",
      "private": true
    }
    """
    Then the JSON response status code should be 201

  @database
  Scenario: Anonymous API client wants to vote for an idea with a comment
    When I send a POST request to "/api/ideas/2/votes" with json:
    """
    {
      "comment": "Je suis un commentaire !",
      "username": "test",
      "email": "test@test.com"
    }
    """
    Then the JSON response status code should be 201

  @security
  Scenario: Logged in API client wants to vote several times for an idea
    Given I am logged in to api as admin
    When I send a POST request to "/api/ideas/2/votes" with json:
    """
    {
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
       "message": "idea.vote.already_voted",
       "errors": @null@
    }
    """

  @security
  Scenario: Anonymous API client wants to vote several times for an idea
    When I send a POST request to "/api/ideas/21/votes" with json:
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
       "message": "idea.vote.already_voted",
       "errors": @null@
    }
    """

  @security
  Scenario: Anonymous API client wants to vote with an email associated to an account
    When I send a POST request to "/api/ideas/2/votes" with json:
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
       "message": "idea.vote.email_belongs_to_user",
       "errors": @null@
    }
    """

  @security
  Scenario: Logged in API client wants to delete a non-existing vote
    Given I am logged in to api as user
    When I send a DELETE request to "/api/ideas/2/votes"
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "You have not voted for this idea.",
      "errors": @null@
    }
    """

  @security
  Scenario: Logged in API client wants to vote for an idea that is not contributable
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/22/votes" with json:
    """
    {
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "This idea is not contributable.",
      "errors": @null@
    }
    """

  @security
  Scenario: Anonymous API client can't vote for an idea that is not contributable
    Given I send a POST request to "/api/ideas/22/votes" with json:
    """
    {
      "username": "test",
      "email": "test@test.com",
      "comment": "Je suis un commentaire"
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "This idea is not contributable.",
      "errors": @null@
    }
    """

  @security
  Scenario: Logged in API client wants to vote with a comment for an idea that is not commentable
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/1/votes" with json:
    """
    {
      "comment": "Je suis un commentaire"
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "This form should not contain extra fields. {\"{{ extra_fields }}\":\"comment\"}",
      "errors": null
    }
    """

  @security
  Scenario: Anonymous API client wants to vote with a comment for an idea that is not commentable
    Given I send a POST request to "/api/ideas/1/votes" with json:
    """
    {
      "username": "test",
      "email": "test@test.com",
      "comment": "Je suis un commentaire"
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
       "message": "This form should not contain extra fields. {\"{{ extra_fields }}\":\"comment\"}",
       "errors": null
    }
    """

  Scenario: Anonymous API client wants get votes
    When I send a GET request to "/api/ideas/2/votes?offset=0&limit=50"
    Then the JSON response should match:
    """
    {
      "votes": @...@,
      "count": @integer@,
      "hasMore": @boolean@
    }
    """

## Report

  # Report from opinion

  @database
  Scenario: Anonymous API client wants to report a idea
    When I send a POST request to "/api/ideas/2/reports" with a valid report json
    Then the JSON response status code should be 401

  @database
  Scenario: Logged in API client wants to report his own idea
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/2/reports" with a valid report json
    Then the JSON response status code should be 403

  @database
  Scenario: Logged in API client wants to report an idea
    Given I am logged in to api as admin
    When I send a POST request to "/api/ideas/2/reports" with a valid report json
    Then the JSON response status code should be 201

  ## Stats

  @parallel-scenario
  Scenario: Non admin wants to get voters of an idea
    Given I am logged in to api as user
    When I send a GET request to "/api/ideas/1/voters"
    Then the JSON response status code should be 403

  @parallel-scenario
  Scenario: Admin wants to get voters of an idea
    Given I am logged in to api as admin
    When I send a GET request to "/api/ideas/1/voters"
    Then the JSON response should match:
    """
    {
      "voters": [
        {
          "username": @string@,
          "email": @string@,
          "isMember": @boolean@
        },
        @...@
      ]
    }
    """
