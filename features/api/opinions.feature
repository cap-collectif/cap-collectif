@opinions
Feature: Opinions

## Get

  @parallel-scenario
  Scenario: Anonymous API client wants to retrieve an opinion
    When I send a GET request to "/api/opinions/57"
    Then the JSON response status code should be 200
    Then the JSON response should match:
    """
    {
      "opinion": {
        "isContribuable": @boolean@,
        "is_trashed": @boolean@,

        "id": @integer@,
        "title": @string@,
        "body": @string@,

        "created_at": "@string@.isDateTime()",
        "updated_at": "@string@.isDateTime()",

        "type": {
          "id": @integer@,
          "title": @string@,
          "subtitle": @string@,
          "voteWidgetType": @integer@,
          "votesHelpText": @string@,
          "commentSystem": @integer@,
          "color": @string@,
          "versionable": @boolean@,
          "linkable": @boolean@,
          "sourceable": @boolean@,
          "votesThreshold": @integer@,
          "votesThresholdHelpText": @string@
        },

        "step": {
          "id": @integer@,
          "projectId": @integer@,
          "position": @integer@,
          "counters": {
            "remainingDays": @integer@,
            "contributions": @integer@,
            "contributors": @integer@,
            "votes": @integer@
          },
          "open": @boolean@,
          "title": @string@,
          "enabled": @boolean@,
          "startAt": "@string@.isDateTime()",
          "endAt": "@string@.isDateTime()",
          "body": @string@,
          "status": @string@
        },

        "argumentsCount": @integer@,
        "arguments_yes_count": @integer@,
        "arguments_no_count": @integer@,
        "arguments": @array@,

        "sources_count": @integer@,
        "sources": @array@,

        "versions_count": @integer@,

        "votes": @array@,
        "votes_nok": @integer@,
        "votes_ok": @integer@,
        "votes_mitige": @integer@,
        "votes_total": @integer@,

        "appendices": [
          {
            "body": @string@,
            "type": {
              "title": @string@
            }
          },
          @...@
        ],

        "connections": @array@,
        "connections_count": @integer@,

        "author": {
          "username": @string@,
          "displayName": @string@,
          "uniqueId": @string@,
          "isAdmin": @boolean@,
          "vip": @boolean@,
          "media": @...@,
          "_links": {
            "profile": @string@,
            "settings": @string@
          }
        },

        "has_user_reported": @boolean@,
        "user_vote": @null@,

        "ranking": @...@,
        "modals": @array@,

        "answer": @...@,

        "_links": {
          "show": @string@,
          "edit": @string@,
          "report": @string@,
          "type": @string@
        }
      },
      "rankingThreshold": @integer@,
      "opinionTerm": @integer@
    }
    """

## Vote

  Scenario: Anonymous API client wants to get all votes of an opinion
    When I send a GET request to "/api/opinions/57/votes"
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
      ]
    }
    """

  ### As an Anonymous

  @parallel-scenario
  Scenario: Anonymous API client wants to vote on an opinion
    When I send a PUT request to "/api/opinions/57/votes" with json:
    """
    {
      "value": 1
    }
    """
    Then the JSON response status code should be 401

  ### As a Logged in user

  @database
  Scenario: logged in API client wants to vote on an opinion
    Given I am logged in to api as user
    # create
    When I send a PUT request to "/api/opinions/57/votes" with json:
    """
    {
      "value": 1
    }
    """
    Then the JSON response status code should be 204
    # update
    When I send a PUT request to "/api/opinions/57/votes" with json:
    """
    {
      "value": -1
    }
    """
    Then the JSON response status code should be 204
    # delete
    When I send a DELETE request to "/api/opinions/57/votes"
    Then the JSON response status code should be 204

### Links

    Scenario: API client wants to list links of an opinion
    When I send a GET request to "/api/opinions/60/links"
    Then the JSON response should match:
    """
    {
      "links": [
        {
          "id": @integer@,
          "title": @string@,

          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",

          "versions_count": @integer@,
          "sources_count": @integer@,
          "argumentsCount": @integer@,
          "connections_count": @integer@,
          "votes_total": @integer@,
          "votes_nok": @integer@,
          "votes_ok": @integer@,
          "votes_mitige": @integer@,

          "author": @...@,

          "type": @...@,

          "user_vote": @null@,
          "has_user_reported": @boolean@,

          "_links": {
            "show": @string@,
            "edit": @string@,
            "report": @string@,
            "type": @string@
          }
        },
        @...@
      ]
    }
    """
