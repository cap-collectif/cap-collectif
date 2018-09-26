Feature: Opinion Types Api

@parallel-scenario
Scenario: API client wants to get an opinion type
  When I send a GET request to "/api/opinion_types/opinionType6"
  Then the JSON response should match:
  """
  {
    "id": "opinionType6",
    "title": @string@,
    "voteWidgetType": @integer@,
    "commentSystem": @integer@,
    "versionable": @boolean@,
    "linkable": @boolean@,
    "sourceable": @boolean@,
    "appendixTypes": @array@,
    "availableLinkTypes": [
      {
        "id": @string@,
        "title": @string@,
        "voteWidgetType": @integer@,
        "commentSystem": @integer@,
        "versionable": @boolean@,
        "linkable": @boolean@,
        "sourceable": @boolean@,
        "appendixTypes": @array@
      },
      @...@
    ]
  }
  """
