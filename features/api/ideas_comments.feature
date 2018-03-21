@ideas_comments
Feature: Ideas comments

## List Comments

  @parallel-scenario
  Scenario: API client wants to list comments of an idea
    When I send a GET request to "/api/ideas/2/comments"
    Then the JSON response should match:
    """
    {
      "commentsAndAnswersCount": @integer@,
      "commentsCount": @integer@,
      "comments":
      [
        {
          "canContribute": @boolean@,
          "id": @integer@,
          "body": @string@,
          "createdAt": "@string@.isDateTime()",
          "updatedAt": "@string@.isDateTime()",
          "votesCount": @integer@,
          "author": {
            "username": @string@,
            "displayName": @string@,
            "isAdmin": @boolean@,
            "uniqueId": @string@,
            "media": @...@,
            "_links": {
              "profile": @string@,
              "settings": @string@
            }
          },
          "answers": @...@,
          "authorEmail": @null@,
          "authorName": @null@,
          "isTrashed": @boolean@,
          "_links": {
            "vote": @string@,
            "edit": @string@
          },
          "hasUserReported": @boolean@,
          "hasUserVoted": @boolean@,
          "canEdit": @boolean@
        },
        @...@
      ]
    }
    """

  @parallel-scenario
  Scenario: API client wants to find the first comment of an idea
    When I send a GET request to "/api/ideas/2/comments?limit=1"
    Then the JSON response should match:
    """
    {
      "commentsAndAnswersCount": @integer@,
      "commentsCount": @integer@,
      "comments":
      [
        {
          "canContribute": @boolean@,
          "id": @integer@,
          "body": @string@,
          "createdAt": "@string@.isDateTime()",
          "updatedAt": "@string@.isDateTime()",
          "votesCount": @integer@,
          "author": @...@,
          "answers": @...@,
          "authorEmail": @null@,
          "authorName": @null@,
          "isTrashed": @boolean@,
          "_links": @...@,
          "hasUserReported": @boolean@,
          "hasUserVoted": @boolean@,
          "canEdit": @boolean@
        }
      ]
    }
    """

  @parallel-scenario
  Scenario: API client wants to find popular comments of an idea
    When I send a GET request to "/api/ideas/2/comments?filter=popular"
    Then the JSON response should match:
    """
    {
      "commentsAndAnswersCount": "@integer@.greaterThan(3)",
      "commentsCount": "@integer@.greaterThan(3)",
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
    When I send a POST request to "/api/ideas/2/comments" with json:
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
    When I send a POST request to "/api/ideas/2/comments" with json:
    """
    {
      "parent": 1,
      "authorName": "Kéké",
      "authorEmail": "vivele94@gmail.com",
      "body": "Ma super réponse"
    }
    """
    Then the JSON response status code should be 201

  @security
  Scenario: Anonymous API client wants to add a comment without user informations
    When I send a POST request to "/api/ideas/2/comments" with json:
    """
    {
      "body": "Vive moi qui suis plus fort que www.google.fr !"
    }
    """
    Then the JSON response status code should be 400

  ### Logged

  @database
  Scenario: logged in API client wants to add a comment
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/2/comments" with json:
    """
    {
      "body": "Vive moi user ! Réponds à ça si tu l'oses."
    }
    """
    Then the JSON response status code should be 201

  @database
  Scenario: logged in API client wants to add an answer to a comment
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/2/comments" with json:
    """
    {
      "parent": 1,
      "body": "Oh oui j'ose :-P"
    }
    """
    Then the JSON response status code should be 201

  @security
  Scenario: logged in API client wants to add a comment by hacking
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/2/comments" with json:
    """
    {
      "parent": 57,
      "body": "Pr0 Hacker"
    }
    """
    Then the JSON response status code should be 404
    And the JSON response should match:
    """
    {
      "code": 404,
      "message": "This parent comment is not linked to this idea",
      "errors": @null@
    }
    """

  @security
  Scenario: logged in API client wants to add a comment to the wrong idea
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/2/comments" with json:
    """
    {
      "parent": 55,
      "body": "Pr0 Hacker"
    }
    """
    Then the JSON response status code should be 404
    And the JSON response should match:
    """
    {
      "code": 404,
      "message": "This parent comment is not linked to this idea",
      "errors": @null@
    }
    """

  @security
  Scenario: logged in API client wants to add an answer to an answer
    Given I am logged in to api as user
    When I send a POST request to "/api/ideas/2/comments" with json:
    """
    {
      "parent": 5,
      "body": "Pr0 Hacker"
    }
    """
    Then the JSON response status code should be 400
    And the JSON response should match:
    """
    {
      "code": 400,
      "message": "You can't answer the answer of a comment.",
      "errors": @null@
    }
    """
