Feature: Opinions

## Get

  Scenario: Anonymous API client wants to retrieve an opinion
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
          "linkable": @boolean@,
          "sourceable": @boolean@,
          "votesThreshold": @integer@,
          "votesThresholdHelpText": @string@
        },

        "step": {
          "id": @integer@,
          "projectId": @integer@
        },

        "arguments_count": @integer@,
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
    When I send a GET request to "/api/opinions/2/sources"
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
          "arguments_count": @integer@,
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
