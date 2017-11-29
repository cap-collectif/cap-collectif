@events_comments
Feature: Events comments

## List Comments

  @parallel-scenario
  Scenario: API client wants to list comments of an event
    When I send a GET request to "/api/events/1/comments"
    Then the JSON response should match:
    """
    {
      "comments_and_answers_count": @integer@,
      "comments_count": @integer@,
      "comments":
      [
        {
          "can_contribute": @boolean@,
          "pinned": @boolean@,
          "id": @integer@,
          "body": @string@,
          "createdAt": "@string@.isDateTime()",
          "updatedAt": "@string@.isDateTime()",
          "votes_count": @integer@,
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
          "answers": [],
          "author_email": @null@,
          "author_name": @null@,
          "is_trashed": @boolean@,
          "_links": {
            "edit": @string@
          },
          "has_user_reported": @boolean@,
          "has_user_voted": @boolean@,
          "can_edit": @boolean@
        },
        @...@
      ]
    }
    """

  @parallel-scenario
  Scenario: API client wants to find the first comment of an event
    When I send a GET request to "/api/events/1/comments?limit=1"
    Then the JSON response should match:
    """
    {
      "comments_and_answers_count": @integer@,
      "comments_count": @integer@,
      "comments":
      [
        {
          "can_contribute": @boolean@,
          "id": @integer@,
          "body": @string@,
          "createdAt": "@string@.isDateTime()",
          "updatedAt": "@string@.isDateTime()",
          "votes_count": @integer@,
          "author": @...@,
          "answers": @...@,
          "author_email": @null@,
          "author_name": @null@,
          "is_trashed": @boolean@,
          "_links": @...@,
          "has_user_reported": @boolean@,
          "has_user_voted": @boolean@,
          "can_edit": @boolean@
        }
      ]
    }
    """

  @parallel-scenario
  Scenario: API client wants to find popular comments of an event
    When I send a GET request to "/api/events/1/comments?filter=popular"
    Then the JSON response should match:
    """
    {
      "comments_and_answers_count": "@integer@",
      "comments_count": "@integer@",
      "comments":
      [
        @...@
      ]
    }
    """
    And the comments should be ordered by popularity


## Create Comments

  ### Anonymous

  @database
  Scenario: Anonymous API client wants to add a comment
    When I send a POST request to "/api/events/1/comments" with json:
    """
    {
      "authorName": "Kéké",
      "authorEmail": "vivele94@gmail.com",
      "body": "Vive moi qui suis plus fort que www.google.fr !"
    }
    """
    Then the JSON response status code should be 201

  @database
  Scenario: Anonymous API client wants to add an answer to a comment
    When I send a POST request to "/api/events/1/comments" with json:
    """
    {
      "parent": 210,
      "authorName": "Kéké",
      "authorEmail": "vivele94@gmail.com",
      "body": "Ma super réponse"
    }
    """
    Then the JSON response status code should be 201

  @security
  Scenario: Anonymous API client wants to add a comment without user informations
    When I send a POST request to "/api/events/1/comments" with json:
    """
    {
      "body": "Vive moi qui suis plus fort que www.google.fr !"
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "Validation Failed",
      "errors": {
        "children": {
          "body":[],
          "parent":[],
          "authorName":{
            "errors":["comment.create.no_author_error"]
          },
          "authorEmail":[]
        }
      }
    }
    """

  ### Logged

  @database
  Scenario: logged in API client wants to add a comment
    Given I am logged in to api as user
    When I send a POST request to "/api/events/1/comments" with json:
    """
    {
      "body": "Vive moi user ! Réponds à ça si tu l'oses."
    }
    """
    Then the JSON response status code should be 201

  @database
  Scenario: logged in API client wants to add an answer to a comment
    Given I am logged in to api as user
    When I send a POST request to "/api/events/1/comments" with json:
    """
    {
      "parent": 210,
      "body": "Oh oui j'ose :-P"
    }
    """
    Then the JSON response status code should be 201

  @security
  Scenario: logged in API client wants to add a comment by hacking
    Given I am logged in to api as user
    When I send a POST request to "/api/events/2/comments" with json:
    """
    {
      "parent": 1,
      "body": "Pr0 Hacker"
    }
    """
    Then the JSON response status code should be 404
    And the JSON response should match:
    """
    {
      "code": 404,
      "message": "This parent comment is not linked to this event",
      "errors": @null@
    }
    """
