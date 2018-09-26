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
        "id": @string@,
        "title": @string@,
        "startAt": "@string@.isDateTime()",
        "createdAt": "@string@.isDateTime()",
        "themes": [
          {
              "id": @integer@,
              "title": @string@,
              "enabled": @boolean@,
              "_links": {"show": @string@}
          },
          @...@
        ],
        "author": @...@,
        "video": @null@,
        "participantsCount": @integer@,
        "contributionsCount": @integer@,
        "votesCount": @integer@,
        "hasParticipativeStep": @boolean@,
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
        "id": "1",
        "title": @string@,
        "startAt": "@string@.isDateTime()",
        "createdAt": "@string@.isDateTime()",
        "themes": [
          {
              "id": @integer@,
              "title": @string@,
              "enabled": @boolean@,
              "_links": {"show": @string@}
          },
          @...@
        ],
        "author": @...@,
        "video": @string@,
        "cover": @array@,
        "participantsCount": @integer@,
        "contributionsCount": @integer@,
        "votesCount": @integer@,
        "hasParticipativeStep": @boolean@,
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
        "id": "4",
        "title": @string@,
        "startAt": "@string@.isDateTime()",
        "createdAt": "@string@.isDateTime()",
        "themes": [
          {
              "id": @integer@,
              "title": @string@,
              "enabled": @boolean@,
              "_links": {"show": @string@}
          },
          @...@
        ],
        "author": @...@,
        "video": @null@,
        "participantsCount": @integer@,
        "contributionsCount": @integer@,
        "hasParticipativeStep": @boolean@,
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
    "count": 5
  }
  """

@security
Scenario: Anonymous API client wants to create a project
  When I send a POST request to "/api/projects"
  Then the JSON response status code should be 401
  And the JSON response should match:
  """
  {"code":401,"message":"Bad credentials"}
  """

@database
Scenario: Admin API client can create a project
  Given I am logged in to api as admin
  And user "user42" doesn't have role "ROLE_ADMIN"
  When I send a POST request to "/api/projects" with json:
  """
  {
    "title": "My new project",
    "Author": "user42"
  }
  """
  Then the JSON response status code should be 201
  And the JSON response should match:
  """
  {
    "_links": {
      "show": @string@,
      "external": @null@,
      "admin": @string@
    }
  }
  """
  And project with slug "my-new-project" should have author "user42"
  And user "user42" should have role "ROLE_ADMIN"
  And project with slug "my-new-project" should not be published
  Then 1 mail should be sent

@parallel-scenario
Scenario: API client wants to get all project steps
  When I send a GET request to "/api/projects/project1/steps"
  Then the JSON response status code should be 200
  And the JSON response should match:
  """
  [
    {
      "projectId": "project1",
      "position": 1,
      "open": false,
      "timeless": false,
      "id": "pstep1",
      "title": "Présentation",
      "enabled": true,
      "startAt": @null@,
      "endAt": @null@,
      "body": @string@,
      "statuses": [],
      "step_type": @string@,
      "status": "closed"
    },
    @...@
  ]
  """
