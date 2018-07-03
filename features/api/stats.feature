@stats
Feature: Stats

@parallel-scenario
Scenario: Anonymous API client wants to get votes stats for a selection step
  When I send a GET request to "/api/project_stats/selectionStep1?key=votes"
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
  When I send a GET request to "/api/project_stats/selectionStep1?key=votes&theme=1"
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
  When I send a GET request to "/api/project_stats/collectstep1?key=themes"
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
Scenario: Anonymous API client wants to get votes stats for a selection step filtered by category
  When I send a GET request to "/api/project_stats/selectionStep1?key=votes&category=pCategory2"
  Then the JSON response status code should be 200
  And the JSON response should match:
  """
  {
    "data": {
      "total": 2,
      "values": @array@
    }
  }
  """

@security
Scenario: Anonymous API client wants to get votes stats for a collect step
  When I send a GET request to "/api/project_stats/collectstep1?key=votes"
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Collect steps have no votes stats."
  }
  """

@security
Scenario: Anonymous API client wants to get districts stats for a selection step
  When I send a GET request to "/api/project_stats/selectionStep1?key=districts"
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Selection steps have no districts stats."
  }
  """
@security
Scenario: Anonymous API client wants to get votes stats for a collect step filtered by theme
  When I send a GET request to "/api/project_stats/collectstep1?key=districts&theme=1"
  Then the JSON response status code should be 200
