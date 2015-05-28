Feature: Synthesis
  As an API client
  I want to manage syntheses


  Scenario: API client wants to list syntheses
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as admin
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
      },
      @...@
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
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as admin
    And I send a GET request to "/api/syntheses/42"
    Then the JSON response should match:
    """
    {
      "id": "42",
      "enabled": true,
      "consultation_step": {
        "slug": "collecte-des-avis",
        "step_type": "consultation"
      },
      "elements": [
        {
          "id": "43",
          "title": "Je suis un élément"
        }
      ]
    }
    """

  Scenario: Non admin API client wants to get a synthesis
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as user
    And I send a GET request to "/api/syntheses/42"
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to get a synthesis
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I send a GET request to "/api/syntheses/42"
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
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as admin
    And I send a PUT request to "/api/syntheses/42" with json:
    """
    {
      "enabled": true
    }
    """
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "id": "42",
      "enabled": true,
      "consultation_step": {
        "slug": "collecte-des-avis",
        "step_type": "consultation"
      },
      "elements": [
        {
          "id": "43",
          "title": "Je suis un élément"
        }
      ]
    }
    """

  Scenario: Non admin API client wants to update a synthesis
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as user
    And I send a PUT request to "/api/syntheses/42" with json:
    """
    {
      "enabled": true
    }
    """
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to update a synthesis
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I send a PUT request to "/api/syntheses/42" with json:
    """
    {
      "enabled": true
    }
    """
    Then the JSON response status code should be 401

  Scenario: API client wants to get synthesis elements
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as admin
    And I send a GET request to "/api/syntheses/42/elements"
    Then the JSON response should match:
    """
    [
      {
        "id": "43",
        "enabled": true,
        "archived": false,
        "title": "Je suis un élément",
        "body": "blabla",
        "notation": 4
      }
    ]
    """

  Scenario: Non admin API client wants to get synthesis elements
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as user
    And I send a GET request to "/api/syntheses/42/elements"
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to get synthesis elements
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I send a GET request to "/api/syntheses/42/elements"
    Then the JSON response status code should be 401

  Scenario: API client wants to get a synthesis element
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as admin
    And I send a GET request to "/api/syntheses/42/elements/43"
    Then the JSON response should match:
    """
    {
      "id": "43",
      "enabled": true,
      "archived": false,
      "title": "Je suis un élément",
      "body": "blabla",
      "notation": 4
    }
    """

  Scenario: Non admin API client wants to get a synthesis element
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as user
    And I send a GET request to "/api/syntheses/42/elements/43"
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to get a synthesis element
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I send a GET request to "/api/syntheses/42/elements/43"
    Then the JSON response status code should be 401

  @database
  Scenario: API client wants to create a synthesis element
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as admin
    And I send a POST request to "/api/syntheses/42/elements" with json:
    """
    {
      "title": "Coucou, je suis un élément.",
      "body": "blabla",
      "notation": 5
    }
    """
    Then the JSON response status code should be 201


  Scenario: Non admin API client wants to create a synthesis element
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as user
    And I send a POST request to "/api/syntheses/42/elements" with json:
    """
    {
      "title": "Coucou, je suis un élément.",
      "body": "blabla",
      "notation": 5
    }
    """
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to create a synthesis element
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I send a POST request to "/api/syntheses/42/elements" with json:
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
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as admin
    And I send a PUT request to "/api/syntheses/42/elements/43" with json:
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
      "id": 43,
      "title": "Je suis un élément",
      "body": "blabla",
      "enabled": true,
      "archived": false,
      "notation": 2
    }
    """

  Scenario: Non admin API client wants to update a synthesis element
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as user
    And I send a PUT request to "/api/syntheses/42/elements/43" with json:
    """
    {
      "enabled": true,
      "notation": 2
    }
    """
    Then the JSON response status code should be 403

  Scenario: Anonymous API client wants to update a synthesis element
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I send a PUT request to "/api/syntheses/42/elements/43" with json:
    """
    {
      "enabled": true,
      "notation": 2
    }
    """
    Then the JSON response status code should be 401

  @database
  Scenario: API client wants to divide a synthesis element
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as admin
    And I send a POST request to "/api/syntheses/42/elements/43/divisions" with json:
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
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as user
    And I send a POST request to "/api/syntheses/42/elements/43/divisions" with json:
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
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I send a POST request to "/api/syntheses/42/elements/43/divisions" with json:
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

  Scenario: API client wants to get a synthesis element history
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as admin
    And I send a GET request to "/api/syntheses/42/elements/43/history"
    Then the JSON response should match:
    """
    [
      {
        "id": @string@,
        "created_at": "@string@.isDateTime()",
        "element_id": "43",
        "element_title": "Je suis un élément",
        "author": {
          "username": "admin",
          "slug": "admin"
        },
        "action": "created",
        "sentence": "admin a créé l'élément \"Je suis un élément\""
      },
      {
        "id": @string@,
        "created_at": "@string@.isDateTime()",
        "element_id": "43",
        "element_title": "Je suis un élément",
        "author": {
          "username": "admin",
          "slug": "admin"
        },
        "action": "updated",
        "sentence": "admin a mis à jour l'élément \"Je suis un élément\""
      }
    ]
    """

    @database @dev
  Scenario: API client wants to have a 'created' log when creating a synthesis element
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I am logged in to api as admin
    And I send a POST request to "/api/syntheses/42/elements" with json:
    """
    {
      "title": "Coucou, je suis un élément.",
      "body": "blabla",
      "notation": 5
    }
    """
    Then there should be a log with values:
      | element_title | Coucou, je suis un élément. |
      | action        | created                     |