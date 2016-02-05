Feature: Opinions Versions

## List

  @parallel-scenario
  Scenario: API client wants to list versions of an opinion
    When I send a GET request to "/api/opinions/57/versions"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "versions": [
        {
          "id": @integer@,
          "title": @string@,
          "slug": @string@,

          "author": {
            "username": @string@,
            "displayName": @string@,
            "uniqueId": @string@,
            "isAdmin": @boolean@,
            "media": @...@,
            "vip": @boolean@,
            "_links": {
              "profile": @string@,
              "settings": @string@
            }
          },
          "parent": {
            "type": {
              "voteWidgetType": @integer@
            },
            "_links": {
              "show": @string@,
              "edit": @string@,
              "report": @string@,
              "type": @string@
            },
            "user_vote": @null@,
            "has_user_reported": @boolean@
          },

          "sources_count": @integer@,

          "arguments_count": @integer@,
          "arguments_yes_count": @integer@,
          "arguments_no_count": @integer@,

          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",

          "ranking": "expr(value === null || value > 0)",

          "votes_total": @integer@,
          "votes_nok": @integer@,
          "votes_ok": @integer@,
          "votes_mitige": @integer@,

          "_links": {
            "show": @string@,
            "report": @string@
          },

          "user_vote": @null@,
          "has_user_reported": @boolean@
        },
        @...@
      ],
      "rankingThreshold": @integer@,
      "opinionTerm": @integer@
    }
    """

## Get

  @parallel-scenario
  Scenario: API client wants to get an opinion version
    When I send a GET request to "/api/opinions/57/versions/1"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "version": {
        "id": @integer@,
        "title": @string@,
        "body": @string@,
        "comment": @string@,
        "created_at": "@string@.isDateTime()",
        "updated_at": "@string@.isDateTime()",
        "is_trashed": @boolean@,
        "isContribuable": @boolean@,

        "arguments": @...@,
        "arguments_yes_count": @integer@,
        "arguments_no_count": @integer@,
        "arguments_count": @integer@,

        "sources": @...@,
        "sources_count": @integer@,

        "votes": @...@,
        "votes_nok": @integer@,
        "votes_ok": @integer@,
        "votes_mitige": @integer@,
        "votes_total": @integer@,

        "parent": {
          "isContribuable": @boolean@,
          "id": @integer@,
          "body": @string@,
          "title": @string@,
          "type": {
            "id": @integer@,
            "title": @string@,
            "color": @string@
          },
          "_links": {
            "show": @string@,
            "edit": @string@,
            "report": @string@,
            "type": @string@
          },
          "user_vote": @null@,
          "has_user_reported": @boolean@
        },
        "author": {
          "username": @string@,
          "displayName": @string@,
          "uniqueId": @string@,
          "isAdmin": @boolean@,
          "media": @...@,
          "_links": {
            "profile": @string@,
            "settings": @string@
          }
        },
        "_links": {
          "show": @string@,
          "report": @string@
        },
        "user_vote": @null@,
        "has_user_reported": @boolean@,

        "ranking": @integer@
      },
      "rankingThreshold": @integer@,
      "opinionTerm": @integer@
    }
    """


## Create

  ### As an Anonymous

  @parallel-scenario
  Scenario: Anonymous API client wants to add a version
    When I send a POST request to "/api/opinions/57/versions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "comment": "Un peu de fun dans ce monde trop sobre !"
    }
    """
    Then the JSON response status code should be 401
    And the JSON response should match:
    """
    {
      "code": 401,
      "message": "Invalid credentials"
    }
    """

  ### As a Logged in user

  @database
  Scenario: logged in API client wants to add a version
    Given I am logged in to api as user
    When I send a POST request to "/api/opinions/57/versions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "comment": "Un peu de fun dans ce monde trop sobre !"
    }
    """
    Then the JSON response status code should be 201

  @database
  Scenario: logged in API client wants to add a version to an uncontributable opinion
    Given I am logged in to api as user
    When I send a POST request to "/api/opinions/56/versions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "comment": "Un peu de fun dans ce monde trop sobre !"
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "Can't add a version to an uncontributable opinion.",
      "errors": @null@
    }
    """

## Update

  @database
  Scenario: Author of a version wants to update it
    Given I am logged in to api as user
    When I send a PUT request to "/api/opinions/57/versions/1" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla"
    }
    """
    Then the JSON response status code should be 204

  @database
  Scenario: Non author of a version wants to update it
    Given I am logged in to api as admin
    When I send a PUT request to "/api/opinions/57/versions/1" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla"
    }
    """
    Then the JSON response status code should be 403


## Vote

  ### As anonymous

  @database
  Scenario: Anonymous API client wants to add a version
    When I send a PUT request to "/api/opinions/57/versions/1/votes" with json:
    """
    {
      "value": 1
    }
    """
    Then the JSON response status code should be 401

  ### As a logged in user

  @database
  Scenario: logged in API client wants to add a version vote
    Given I am logged in to api as user
    When I send a PUT request to "/api/opinions/57/versions/1/votes" with json:
    """
    {
      "value": 1
    }
    """
    Then the JSON response status code should be 204
    When I send a PUT request to "/api/opinions/57/versions/1/votes" with json:
    """
    {
      "value": -1
    }
    """
    Then the JSON response status code should be 204
    When I send a DELETE request to "/api/opinions/57/versions/1/votes"
    Then the JSON response status code should be 204

## Argument

  ### As anonymous

  @database
  Scenario: Anonymous API client wants to add an argument to an opinion version
    When I send a POST request to "/api/opinions/57/versions/1/arguments" with json:
    """
    {
      "type": 1,
      "body": "Tu veux voir mon gros argument ?"
    }
    """
    Then the JSON response status code should be 401

  ### As a Logged in user
  @database
  Scenario: logged in API client wants to add an argument to an opinion version
    Given I am logged in to api as user
    When I send a POST request to "/api/opinions/57/versions/1/arguments" with json:
    """
    {
      "type": 1,
      "body": "Tu veux voir mon gros argument ?"
    }
    """
    Then the JSON response status code should be 201

