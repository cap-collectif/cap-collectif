@opinions
Feature: Opinions

@security
Scenario: Anonymous API client wants to add an opinion
  When I send a POST request to "/api/projects/project5/steps/Q29uc3VsdGF0aW9uOmNzdGVwNQ==/opinion_types/opinionType10/opinions" with a valid opinion json
  Then the JSON response status code should be 401

@security
Scenario: logged in API client wants to add an opinion to a not enabled opinionType
  Given I am logged in to api as user
  When I send a POST request to "/api/projects/project1/steps/Q29uc3VsdGF0aW9uOmNzdGVwNA==/opinion_types/opinionType1/opinions" with a valid opinion json
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "This opinionType is not enabled."
  }
  """

@database @rabbitmq
Scenario: logged in API client wants to add an opinion
  Given I am logged in to api as user
  When I send a POST request to "/api/projects/project5/steps/Q29uc3VsdGF0aW9uOmNzdGVwNQ==/opinion_types/opinionType10/opinions" with a valid opinion json
  Then the JSON response status code should be 201
  Then the queue associated to "opinion_create" producer has messages below:
  | 0 | {"opinionId": "@uuid@"} |

@security @database
Scenario: logged in API client can not add more than 2 opinions in a minute
  Given I am logged in to api as user
  And I send a POST request to "/api/projects/project5/steps/Q29uc3VsdGF0aW9uOmNzdGVwNQ==/opinion_types/opinionType10/opinions" with a valid opinion json
  And the JSON response status code should be 201
  And I send a POST request to "/api/projects/project5/steps/Q29uc3VsdGF0aW9uOmNzdGVwNQ==/opinion_types/opinionType10/opinions" with a valid opinion json
  And the JSON response status code should be 201
  When I send a POST request to "/api/projects/project5/steps/Q29uc3VsdGF0aW9uOmNzdGVwNQ==/opinion_types/opinionType10/opinions" with a valid opinion json
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
      "code": 400,
      "message": "You contributed too many times."
  }
  """

@database @rabbitmq
Scenario: logged in API client wants to add an opinion with appendices
  Given I am logged in to api as user
  When I send a POST request to "/api/projects/project5/steps/Q29uc3VsdGF0aW9uOmNzdGVwNQ==/opinion_types/opinionType5/opinions" with json:
  """ 
  {
    "title": "Nouveau titre",
    "body": "Mes modifications blablabla",
    "appendices": [
      {
        "appendixType": "1",
        "body": "Voici mon exposé des motifs"
      },
      {
        "appendixType": "2",
        "body": "Voici mon étude d'impact"
      }
    ]
  }
  """
  Then the JSON response status code should be 201
  Then the queue associated to "opinion_create" producer has messages below:
  | 0 | {"opinionId": "@uuid@"} |

@security
Scenario: logged in API client wants to add an opinion with an appendixType from a wrong opinionType
  Given I am logged in to api as user
  When I send a POST request to "/api/projects/project5/steps/Q29uc3VsdGF0aW9uOmNzdGVwNQ==/opinion_types/opinionType7/opinions" with json:
  """
  {
    "title": "Nouveau titre",
    "body": "Mes modifications blablabla",
    "appendices": [
      {
        "appendixType": "3",
        "body": "Voici mon exposé des mensonges"
      }
    ]
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
      "code": 400,
      "message":"Validation Failed",
      "errors": {
        "errors": ["opinion.wrong_appendices"],
        "children": @...@
     }
  }
  """

@security
Scenario: logged in API client wants to add an opinion with unknown appendixType
  Given I am logged in to api as user
  When I send a POST request to "/api/projects/project5/steps/Q29uc3VsdGF0aW9uOmNzdGVwNQ==/opinion_types/opinionType7/opinions" with json:
  """
  {
    "title": "Nouveau titre",
    "body": "Mes modifications blablabla",
    "appendices": [
      {
        "appendixType": "666",
        "body": "Voici mon exposé qui n'existe pas"
      }
    ]
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
      "code": 400,
      "message": "Validation Failed",
      "errors": {
          "errors": ["opinion.wrong_appendices"],
          "children": @...@
      }
  }
  """

## Update
@security
Scenario: Anonymous API client wants to update an opinion
  When I send a PUT request to "/api/opinions/opinion3" with a valid opinion json
  Then the JSON response status code should be 401

@security
Scenario: Logged in API client wants to update an opinion but is not the author
  Given I am logged in to api as admin
  When I send a PUT request to "/api/opinions/opinion3" with a valid opinion json
  Then the JSON response status code should be 403

@database @rabbitmq
Scenario: Logged in API client wants to update his opinion
  Given I am logged in to api as user
  When I send a PUT request to "/api/opinions/opinion3" with a valid opinion json
  Then the JSON response status code should be 200
  Then the queue associated to "opinion_update" producer has messages below:
  | 0 | {"opinionId": "opinion3"} |
