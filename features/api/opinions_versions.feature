@versions
Feature: Opinions Versions

## List

  @parallel-scenario
  Scenario: API client wants to list versions of an opinion
    When I send a GET request to "/api/opinions/opinion57/versions"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "versions": [
        {
          "id": @string@,
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
              "type": @string@
            },
            "user_vote": @null@,
            "hasUserReported": @boolean@
          },

          "sourcesCount": @integer@,

          "argumentsCount": @integer@,
          "argumentsYesCount": @integer@,
          "argumentsNoCount": @integer@,

          "createdAt": "@string@.isDateTime()",
          "updatedAt": "@string@.isDateTime()",

          "ranking": "expr(value === null || value > 0)",

          "votesCount": @integer@,
          "votes_nok": @integer@,
          "votes_ok": @integer@,
          "votes_mitige": @integer@,

          "_links": {
            "show": @string@,
            "parent": @string@
          },

          "user_vote": @null@,
          "hasUserReported": @boolean@
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
    When I send a GET request to "/api/opinions/opinion57/versions/version1"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "version": {
        "id": @string@,
        "title": @string@,
        "body": @string@,
        "comment": @string@,
        "createdAt": "@string@.isDateTime()",
        "updatedAt": "@string@.isDateTime()",
        "isTrashed": @boolean@,
        "isContribuable": @boolean@,

        "arguments": @...@,
        "argumentsYesCount": @integer@,
        "argumentsNoCount": @integer@,
        "argumentsCount": @integer@,

        "sources": @...@,
        "sourcesCount": @integer@,

        "votes": @...@,
        "votes_nok": @integer@,
        "votes_ok": @integer@,
        "votes_mitige": @integer@,
        "votesCount": @integer@,

        "parent": {
          "isContribuable": @boolean@,
          "id": @string@,
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
            "type": @string@
          },
          "user_vote": @null@,
          "hasUserReported": @boolean@
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
          "parent": @string@
        },
        "user_vote": @null@,
        "hasUserReported": @boolean@,

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
    When I send a POST request to "/api/opinions/opinion57/versions" with json:
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
      "message": "Bad credentials"
    }
    """

  ### As a Logged in user

  @database
  Scenario: logged in API client wants to add a version
    Given I am logged in to api as user
    When I send a POST request to "/api/opinions/opinion57/versions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "comment": "Un peu de fun dans ce monde trop sobre !"
    }
    """
    Then the JSON response status code should be 201

  @security
  Scenario: logged in API client wants to add a version
    Given I am logged in to api as user
    When I send a POST request to "/api/opinions/opinion57/versions" with json:
    """
    {
      "title": "",
      "body": "",
      "comment": ""
    }
    """
    Then the JSON response status code should be 400

  @database
  Scenario: logged in API client wants to add a version to an uncontributable opinion
    Given I am logged in to api as user
    When I send a POST request to "/api/opinions/opinion56/versions" with json:
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
    When I send a PUT request to "/api/opinions/opinion57/versions/version1" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla"
    }
    """
    Then the JSON response status code should be 204

  @security
  Scenario: Non author of a version wants to update it
    Given I am logged in to api as admin
    When I send a PUT request to "/api/opinions/opinion57/versions/version1" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla"
    }
    """
    Then the JSON response status code should be 403

  @security
  Scenario: Anonymous wnats to update a version
    Given I send a PUT request to "/api/opinions/opinion57/versions/version1" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla"
    }
    """
    Then the JSON response status code should be 401

## Delete

  @database
  Scenario: Author of a version wants to delete it
    Given I am logged in to api as user
    When I send a DELETE request to "/api/opinions/opinion57/versions/version1"
    Then the JSON response status code should be 204

  @security
  Scenario: Non author of a version wants to delete it
    Given I am logged in to api as admin
    When I send a DELETE request to "/api/opinions/opinion57/versions/version1"
    Then the JSON response status code should be 403

  @security
  Scenario: Anonymous wants to delete a version
    Given I send a DELETE request to "/api/opinions/opinion57/versions/version1"
    Then the JSON response status code should be 401

## Vote

  Scenario: Anonymous API client wants to get all votes of a version
    When I send a GET request to "/api/opinions/opinion57/versions/version2/votes"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "votes": [
        {
          "user": @...@,
          "value": @integer@
        },
        @...@
      ],
      "count": @integer@,
      "hasMore": @boolean@
    }
    """

  ### As anonymous

  @database
  Scenario: Anonymous API client wants to add a version
    When I send a PUT request to "/api/opinions/opinion57/versions/version1/votes" with json:
    """
    {
      "value": 1
    }
    """
    Then the JSON response status code should be 401

  ### As a logged in user

  @database
  Scenario: Logged in API client can add, change and delete a version vote
    Given I am logged in to api as user
    When I send a PUT request to "/api/opinions/opinion57/versions/version1/votes" with json:
    """
    {
      "value": 1
    }
    """
    Then the JSON response status code should be 200
    When I send a PUT request to "/api/opinions/opinion57/versions/version1/votes" with json:
    """
    {
      "value": -1
    }
    """
    Then the JSON response status code should be 200
    When I send a DELETE request to "/api/opinions/opinion57/versions/version1/votes"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "user": @...@,
      "value": -1
    }
    """
