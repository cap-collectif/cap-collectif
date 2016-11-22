@projects
Feature: Projects

    @parallel-scenario
    Scenario: API client wants to get all projects
        When I send a GET request to "/api/projects"
        Then the JSON response status code should be 200
        And the JSON response should match:
    """
    {
      "projects": [
        {
          "id": 4,
          "title": @string@,
          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",
          "themes": [
            {
                "id": @integer@,
                "title": @string@,
                "enabled": @boolean@,
                "_links": {"show": @string@}
            },
            @...@
          ],
          "video": @null@,
          "participantsCount": @integer@,
          "contributionsCount": @integer@,
          "votesCount": @integer@,
          "projectType": {
            "title": @string@,
            "slug": @string@,
            "color": @string@
          },
          "steps": @array@,
          "_links": {"show": @string@}
        },
        @...@
      ],
      "page": @integer@,
      "pages": @integer@,
      "count": @integer@
    }
    """

    @parallel-scenario
    Scenario: API client wants to get all consultation projects
        When I send a GET request to "/api/projects?orderBy=popularity"
        Then the JSON response status code should be 200
        And the JSON response should match:
    """
    {
      "projects": [
        {
          "id": 1,
          "title": @string@,
          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",
          "themes": [
            {
                "id": @integer@,
                "title": @string@,
                "enabled": @boolean@,
                "_links": {"show": @string@}
            },
            @...@
          ],
          "video": @string@,
          "cover": @array@,
          "participantsCount": @integer@,
          "contributionsCount": @integer@,
          "votesCount": @integer@,
          "projectType": {
            "title": @string@,
            "slug": @string@,
            "color": @string@
          },
          "steps": @array@,
          "_links": {"show": @string@}
        },
        @...@
      ],
      "page": @integer@,
      "pages": @integer@,
      "count": @integer@
    }
    """

    @parallel-scenario
    Scenario: API client wants to get all projects sorted by popularity
        When I send a GET request to "/api/projects?type=consultation"
        Then the JSON response status code should be 200
        And the JSON response should match:
    """
    {
      "projects": [
        {
          "id": 4,
          "title": @string@,
          "created_at": "@string@.isDateTime()",
          "updated_at": "@string@.isDateTime()",
          "themes": [
            {
                "id": @integer@,
                "title": @string@,
                "enabled": @boolean@,
                "_links": {"show": @string@}
            },
            @...@
          ],
          "video": @null@,
          "participantsCount": @integer@,
          "contributionsCount": @integer@,
          "votesCount": @integer@,
          "projectType": {
            "title": @string@,
            "slug": @string@,
            "color": @string@
          },
          "steps": @array@,
          "_links": {"show": @string@}
        },
        @...@
      ],
      "page": 1,
      "pages": 1,
      "count": 3
    }
    """
