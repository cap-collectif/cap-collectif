@test
Feature: Opinions

## List Versions

  Scenario: API client wants to list versions of an opinion
    When I send a GET request to "/api/opinions/53/versions"
    Then the JSON response should match:
    """
    {
      "versions": [
        {
          "id": @integer@,
          "title": @string@,
          "body": @string@,
          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",
          "is_trashed": @boolean@,
          "vote_count": @integer@,
          "argument_count": @integer@,
          "source_count": @integer@,
          "author": {
            "username": @string@,
            "display_name": @string@,
            "unique_id": @string@,
            "media": {
              "url": "@string@.startsWith('/media')"
            },
            "_links": {
              "profile": @string@
            }
          },
          "_links": {
            "show": @string@
          }
        },
        @...@
      ],
      "isOpinionContributable": @boolean@
    }
    """

## Create Versions

  ### Anonymous

  @database
  Scenario: Anonymous API client wants to add a version
    When I send a POST request to "/api/opinions/53/versions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "comment": "Un peu de fun dans ce monde trop sobre !"
    }
    """
    Then the JSON response status code should be 400

  ### Logged

  @database
  Scenario: logged in API client wants to add a comment
    Given I am logged in to api as user
    When I send a POST request to "/api/opinions/53/versions" with json:
    """
    {
      "title": "Nouveau titre",
      "body": "Mes modifications blablabla",
      "comment": "Un peu de fun dans ce monde trop sobre !"
    }
    """
    Then the JSON response status code should be 201


