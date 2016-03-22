@stats
Feature: Stats

  @parallel-scenario
  Scenario: Anonymous API client wants to get votes stats for a selection step
    When I send a GET request to "/api/project_stats/6?key=votes"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "data": {
        "total": @integer@,
        "values": [
          {
            "value": @...@,
            "name": @string@,
            "percentage": @number@
          },
          @...@
        ]
      }
    }
    """

  @parallel-scenario
  Scenario: Anonymous API client wants to get votes stats for a selection step filtered by theme
    When I send a GET request to "/api/project_stats/6?key=votes&theme=1"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "data": {
        "total": @integer@,
        "values": []
      }
    }
    """

  @parallel-scenario
  Scenario: Anonymous API client wants to get themes stats for a collect step
    When I send a GET request to "/api/project_stats/20?key=themes"
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "data": {
        "total": @integer@,
        "values": [
          {
            "value": @...@,
            "name": @string@,
            "percentage": @number@
          },
          @...@
        ]
      }
    }
    """

  @security
  Scenario: Anonymous API client wants to get votes stats for a collect step
    When I send a GET request to "/api/project_stats/20?key=votes"
    Then the JSON response status code should be 401
    And the JSON response should match:
    """
    {
      "code": 401,
      "message": "Collect steps have no votes stats.",
      "errors": @null@
    }
    """

  @security
  Scenario: Anonymous API client wants to get districts stats for a selection step
    When I send a GET request to "/api/project_stats/6?key=districts"
    Then the JSON response status code should be 401
    And the JSON response should match:
    """
    {
      "code": 401,
      "message": "Selection steps have no districts stats.",
      "errors": @null@
    }
    """

  @security
  Scenario: Anonymous API client wants to get votes stats for a collect step filtered by theme
    When I send a GET request to "/api/project_stats/20?key=districts&theme=1"
    Then the JSON response status code should be 401
    And the JSON response should match:
    """
    {
      "code": 401,
      "message": "Only votes stats can be filtered by theme or district.",
      "errors": @null@
    }
    """
