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
          "userVote": @null@,
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
        "votesCountNok": @integer@,
        "votesCountOk": @integer@,
        "votesCountMitige": @integer@,

        "_links": {
          "show": @string@,
          "parent": @string@
        },

        "userVote": @null@,
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
      "votesCountNok": @integer@,
      "votesCountOk": @integer@,
      "votesCountMitige": @integer@,
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
        "userVote": @null@,
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
      "userVote": @null@,
      "hasUserReported": @boolean@,

      "ranking": @integer@
    },
    "rankingThreshold": @integer@,
    "opinionTerm": @integer@
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
