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
              "title": @string@,
              "id": @integer@
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

## Create

  @security
  Scenario: Anonymous API client wants to add an opinion
    When I send a POST request to "/api/projects/5/steps/5/opinion_types/10/opinions" with a valid opinion json
    Then the JSON response status code should be 401

  @security
  Scenario: logged in API client wants to add an opinion to a not enabled opinionType
    Given I am logged in to api as user
    When I send a POST request to "/api/projects/1/steps/4/opinion_types/1/opinions" with a valid opinion json
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "This opinionType is not enabled.",
      "errors": @null@
    }
    """

  @database
  Scenario: logged in API client wants to add an opinion
    Given I am logged in to api as user
    When I send a POST request to "/api/projects/5/steps/5/opinion_types/10/opinions" with a valid opinion json
    Then the JSON response status code should be 201

  @database
  Scenario: logged in API client wants to add an opinion with appendices
    Given I am logged in to api as user
    When I send a POST request to "/api/projects/5/steps/5/opinion_types/7/opinions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "appendices": [
        {
          "appendixType": 1,
          "body": "Voici mon exposé des motifs"
        },
        {
          "appendixType": 2,
          "body": "Voici mon étude d'impact"
        }
      ]
    }
    """
    Then the JSON response status code should be 201

    @security
    Scenario: logged in API client wants to add an opinion with an appendixType from a wrong opinionType
      Given I am logged in to api as user
      When I send a POST request to "/api/projects/5/steps/5/opinion_types/7/opinions" with json:
      """
      {
        "title": "Nouveau titre",
        "body": "Mes modifications blablabla",
        "appendices": [
          {
            "appendixType": 3,
            "body": "Voici mon exposé des mensonges"
          }
        ]
      }
      """
      Then the JSON response status code should be 400
      And the JSON response should match:
      """
      {
          "code": 400,
          "message":"Validation Failed",
          "errors": {
            "errors": ["Appendices must correspond to the opinion type."],
            "children": @...@
         }
      }
      """

      @security
      Scenario: logged in API client wants to add an opinion with unknown appendixType
        Given I am logged in to api as user
        When I send a POST request to "/api/projects/5/steps/5/opinion_types/7/opinions" with json:
        """
        {
          "title": "Nouveau titre",
          "body": "Mes modifications blablabla",
          "appendices": [
            {
              "appendixType": 666,
              "body": "Voici mon exposé qui n'existe pas"
            }
          ]
        }
        """
        Then the JSON response status code should be 400
        And the JSON response should match:
        """
        {
            "code": 400,
            "message": "Validation Failed",
            "errors": {
                "errors": ["Appendices must correspond to the opinion type."],
                "children": @...@
            }
        }
        """
## Update

  @security
  Scenario: Anonymous API client wants to update a source
    When I send a PUT request to "/api/opinions/3" with a valid opinion json
    Then the JSON response status code should be 401

  @security
  Scenario: Logged in API client wants to update an opinion but is not the author
    Given I am logged in to api as admin
    When I send a PUT request to "/api/opinions/3" with a valid opinion json
    Then the JSON response status code should be 403

  @database
  Scenario: Logged in API client wants to update his opinion
    Given I am logged in to api as user
    When I send a PUT request to "/api/opinions/3" with a valid opinion json
    Then the JSON response status code should be 200

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
