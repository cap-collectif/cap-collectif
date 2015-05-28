Feature: Synthesis
  As an API client
  I want to manage syntheses

  Scenario: API client wants to list syntheses
    Given I am logged in to api as admin
    And I send a GET request to "/api/syntheses"
    Then the JSON response should match:
    """
    [
      {
        "id": @string@,
        "enabled": @boolean@,
        "consultation_step": {
          "slug": @string@,
          "step_type": "consultation"
        },
        "elements": [
          {
            "id": @string@,
            "title": @string@
          }
        ]
      }
    ]
    """

  Scenario: Non admin API client wants to list syntheses
    Given I am logged in to api as user
    And I send a GET request to "/api/syntheses"
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to list syntheses
    Given I send a GET request to "/api/syntheses"
    Then the JSON response status code should be 401

  Scenario: API client wants to get a synthesis
    Given I am logged in to api as admin
    And I try to get first synthesis
    Then the JSON response should match:
    """
    {
      "id": @string@,
      "enabled": @boolean@,
      "consultation_step": {
        "slug": @string@,
        "step_type": "consultation"
      },
      "elements": [
        {
          "id": @string@,
          "title": @string@
        }
      ]
    }
    """

  Scenario: Non admin API client wants to get a synthesis
    Given I am logged in to api as user
    And I try to get first synthesis
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to get a synthesis
    Given I try to get first synthesis
    Then the JSON response status code should be 401

  @database
  Scenario: API client wants to create a synthesis
    Given I am logged in to api as admin
    And I send a POST request to "/api/syntheses" with json:
    """
    {
      "enabled": true
    }
    """
    Then the JSON response status code should be 201

  Scenario: Non admin API client wants to create a synthesis
    Given I am logged in to api as user
    And I send a POST request to "/api/syntheses" with json:
    """
    {
      "enabled": true
    }
    """
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to create a synthesis
    Given I send a POST request to "/api/syntheses" with json:
    """
    {
      "enabled": true
    }
    """
    Then the JSON response status code should be 401

  @database
  Scenario: API client wants to update a synthesis
    Given I am logged in to api as admin
    And I try to update first synthesis with json:
    """
    {
      "enabled": true
    }
    """
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "id": @string@,
      "enabled": true,
      "consultation_step": {
        "slug": @string@,
        "step_type": "consultation"
      },
      "elements": [
        {
          "id": @string@,
          "title": @string@
        }
      ]
    }
    """

  Scenario: Non admin API client wants to update a synthesis
    Given I am logged in to api as user
    And I try to update first synthesis with json:
    """
    {
      "enabled": true
    }
    """
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to update a synthesis
    Given I try to update first synthesis with json:
    """
    {
      "enabled": true
    }
    """
    Then the JSON response status code should be 401

  Scenario: API client wants to get synthesis elements
    Given I am logged in to api as admin
    And I try to get first synthesis elements
    Then the JSON response should match:
    """
    [
      {
        "id": @string@,
        "title": @string@,
        "body": @string@,
        "enabled": @boolean@,
        "archived": @boolean@,
        "notation": @integer@
      }
    ]
    """

  Scenario: Non admin API client wants to get synthesis elements
    Given I am logged in to api as user
    And I try to get first synthesis elements
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to get synthesis elements
    Given I try to get first synthesis elements
    Then the JSON response status code should be 401

  Scenario: API client wants to get a synthesis element
    Given I am logged in to api as admin
    And I try to get first element of first synthesis
    Then the JSON response should match:
    """
    {
      "id": @string@,
      "title": @string@,
      "body": @string@,
      "enabled": @boolean@,
      "archived": @boolean@,
      "notation": @integer@
    }
    """

  Scenario: Non admin API client wants to get a synthesis element
    Given I am logged in to api as user
    And I try to get first element of first synthesis
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to get a synthesis element
    Given I try to get first element of first synthesis
    Then the JSON response status code should be 401

  @database
  Scenario: API client wants to create a synthesis element
    Given I am logged in to api as admin
    And I try to create an element in first synthesis with json:
    """
    {
      "title": "Coucou, je suis un élément.",
      "body": "blabla",
      "notation": 5
    }
    """
    Then the JSON response status code should be 201

  Scenario: Non admin API client wants to create a synthesis element
    Given I am logged in to api as user
    And I try to create an element in first synthesis with json:
    """
    {
      "title": "Coucou, je suis un élément.",
      "body": "blabla",
      "notation": 5
    }
    """
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to create a synthesis element
    Given I try to create an element in first synthesis with json:
    """
    {
      "title": "Coucou, je suis un élément.",
      "body": "blabla",
      "notation": 5
    }
    """
    Then the JSON response status code should be 401

  @database
  Scenario: API client wants to update a synthesis element
    Given I am logged in to api as admin
    And I try to update an element in first synthesis with json:
    """
    {
      "enabled": true,
      "notation": 2
    }
    """
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "id": @string@,
      "title": @string@,
      "body": @string@,
      "enabled": true,
      "archived": @boolean@,
      "notation": 2
    }
    """

  Scenario: Non admin API client wants to update a synthesis element
    Given I am logged in to api as user
    And I try to update an element in first synthesis with json:
    """
    {
      "enabled": true,
      "notation": 2
    }
    """
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to update a synthesis element
    Given I try to update an element in first synthesis with json:
    """
    {
      "enabled": true,
      "notation": 2
    }
    """
    Then the JSON response status code should be 401

  @database
  Scenario: API client wants to divide a synthesis element
    Given I am logged in to api as admin
    And I try to divide an element in first synthesis with json:
    """
    {
      "elements": [
        {
          "title": "Coucou, je suis un élément.",
          "body": "blabla",
          "notation": 5
        },
        {
          "title": "Coucou, je suis un autre élément.",
          "body": "blabla",
          "notation": 3
        },
        {
          "title": "Coucou, je suis le dernier élément.",
          "body": "blabla",
          "notation": 2
        }
      ]
    }
    """
    Then the JSON response status code should be 201

  Scenario: Non admin API client wants to divide a synthesis element
    Given I am logged in to api as user
    And I try to divide an element in first synthesis with json:
    """
    {
      "elements": [
        {
          "title": "Coucou, je suis un élément.",
          "body": "blabla",
          "notation": 5
        },
        {
          "title": "Coucou, je suis un autre élément.",
          "body": "blabla",
          "notation": 3
        },
        {
          "title": "Coucou, je suis le dernier élément.",
          "body": "blabla",
          "notation": 2
        }
      ]
    }
    """
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to divide a synthesis element
    Given I try to divide an element in first synthesis with json:
    """
    {
      "elements": [
        {
          "title": "Coucou, je suis un élément.",
          "body": "blabla",
          "notation": 5
        },
        {
          "title": "Coucou, je suis un autre élément.",
          "body": "blabla",
          "notation": 3
        },
        {
          "title": "Coucou, je suis le dernier élément.",
          "body": "blabla",
          "notation": 2
        }
      ]
    }
    """
    Then the JSON response status code should be 401