Feature: Opinions

## Source

  ### List

    Scenario: API client wants to list sources of an opinion
    When I send a GET request to "/api/opinions/sources"
    Then the JSON response should match:
    """
    {
      "sources": [
        {
          "id": @integer@,
          "title": @string@,
          "category": @string@,
          "body": @string@,
          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",
          "votes_count": @integer@,
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
            "edit": @string@,
            "report": @string@
          },
          "has_user_voted": @boolean@s,
          "has_user_reported": @boolean@
        },
        @...@
      ],
      "isOpinionContributable": @boolean@
    }
    """

  ### As an Anonymous
  @database
  Scenario: logged in API client wants to add a source to an opinion version
    When I send a POST request to "/api/opinions/57/sources" with json:
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
    When I send a POST request to "/api/opinions/57/sources" with json:
    """
    {
      "link": "http://google.com",
      "title": "Je suis une source",
      "body": "Jai un corps mais pas de bras :'(",
      "Category": 1
    }
    """
    Then the JSON response status code should be 201
