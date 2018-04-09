@opinion_links
Feature: Opinions Links

  Scenario: API client wants to list links of an opinion
    When I send a GET request to "/api/opinions/opinion60/links"
    Then the JSON response should match:
    """
    {
      "links": [
        {
          "id": @integer@,
          "title": @string@,

          "createdAt": "@string@.isDateTime()",
          "updatedAt": "@string@.isDateTime()",

          "versionsCount": @integer@,
          "sourcesCount": @integer@,
          "argumentsCount": @integer@,
          "connectionsCount": @integer@,
          "votesCount": @integer@,
          "votesCountNok": @integer@,
          "votesCountOk": @integer@,
          "votesCountMitige": @integer@,

          "author": @...@,

          "type": @...@,

          "userVote": @null@,
          "hasUserReported": @boolean@,

          "_links": {
            "show": @string@,
            "type": @string@
          }
        },
        @...@
      ]
    }
    """

  @security
  Scenario: logged in API client wants to add an opinion link
    Given I am logged in to api as user
    When I send a POST request to "/api/opinions/opinion1/links" with a valid link opinion json
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "This opinion type is not enabled.",
      "errors": @null@
    }
    """

  @security
  Scenario: logged in API client wants to add an opinion link
    Given I am logged in to api as user
    When I send a POST request to "/api/opinions/opinion2/links" with a valid link opinion json
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "This opinion type is not linkable.",
      "errors": @null@
    }
    """

  @database
  Scenario: logged in API client wants to add an opinion link
    Given I am logged in to api as user
    When I send a POST request to "/api/opinions/opinion60/links" with a valid link opinion json
    Then the JSON response status code should be 201
