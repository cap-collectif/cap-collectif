Feature: Opinions

## Get

  Scenario: API client wants to retrieve an opinion
    When I send a GET request to "/api/opinions/57"
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
          "sourceable": @boolean@,
          "votesThreshold": @integer@,
          "votesThresholdHelpText": @string@
        },

        "arguments_count": @integer@,
        "arguments_yes_count": @integer@,
        "arguments_no_count": @integer@,
        "arguments": @...@,

        "sources_count": @integer@,
        "sources": @...@,

        "versions_count": @integer@,

        "votes": @...@,
        "votes_nok": @integer@,
        "votes_ok": @integer@,
        "votes_mitige": @integer@,
        "votes_total": @integer@,

        "appendices": [
          {
            "body": @string@,
            "type": {
              "title": @string@,
              "position": @integer@
            }
          },
          @...@
        ],

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
          "edit": @string@,
          "report": @string@,
          "type": @string@
        },

        "has_user_reported": @boolean@,
        "user_vote": @null@,

        "ranking": @integer@
      },
      "rankingThreshold": @integer@,
      "opinionTerm": @integer@
    }
    """

## Vote

  ### As an Anonymous

  @database
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

## Source

  ### List

    Scenario: API client wants to list sources of an opinion
    When I send a GET request to "/api/opinions/3/sources"
    Then the JSON response should match:
    """
    {
      "sources": [
        {
          "id": @integer@,
          "title": @string@,
          "category": @string@,
          "body": @string@,
          "link": @string@,
          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",
          "votes_count": @integer@,
          "isContribuable": @boolean@,
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
          "_links": {
            "edit": @string@,
            "report": @string@
          },
          "has_user_voted": @boolean@,
          "has_user_reported": @boolean@
        },
        @...@
      ]
    }
    """

  ### As an Anonymous
  @database
  Scenario: logged in API client wants to add a source to an opinion version
    When I send a POST request to "/api/opinions/1/sources" with json:
    """
    {
      "link": "http://google.com",
      "title": "Je suis une source",
      "body": "Jai un corps mais pas de bras :'(",
      "Category": 1
    }
    """
    Then the JSON response status code should be 401

  ### As a Logged in user
  @database
  Scenario: logged in API client wants to add an argument to an opinion version
    Given I am logged in to api as user
    When I send a POST request to "/api/opinions/1/sources" with json:
    """
    {
      "link": "http://google.com",
      "title": "Je suis une source",
      "body": "Jai un corps mais pas de bras :'(",
      "Category": 1
    }
    """
    Then the JSON response status code should be 201
