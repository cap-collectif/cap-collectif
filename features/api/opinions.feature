@test
Feature: Opinions

## List Versions

  Scenario: API client wants to list versions of an opinion
    When I send a GET request to "/api/opinions/57/versions"
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
          "arguments_count": @integer@,
          "sources_count": @integer@,
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

  ### As an Anonymous

  @database
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
    Then the JSON response status code should be 500
    And the JSON response should match:
    """
    {
      "code": 500,
      "message": "Can't add a version to an uncontributable opinion.",
      "errors": @null@
    }
    """
