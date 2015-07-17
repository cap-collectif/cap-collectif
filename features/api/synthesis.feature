Feature: Synthesis
  As an API client
  I want to manage syntheses

  @database
  Scenario: API client wants to list syntheses
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a GET request to "/api/syntheses"
    Then the JSON response should match:
    """
    [
      {
        "id": @string@,
        "elements": [
          {
            "id": @string@,
            "title": @string@,
            "_links": {
              "self": { "href": "@string@.startsWith('/api/syntheses/').contains('/elements/')" },
              "divide": { "href": "@string@.startsWith('/api/syntheses/').contains('/elements/').endsWith('/divisions')" },
              "history": { "href": "@string@.startsWith('/api/syntheses/').contains('/elements/').endsWith('/history')" }
            }
          }
        ],
        "_links": {
          "self": { "href": "@string@.startsWith('/api/syntheses/')" },
          "elements": { "href": "@string@.startsWith('/api/syntheses/').endsWith('/elements')" }
        }
      },
      @...@
    ]
    """

  @database
  Scenario: API client wants to get a synthesis
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I send a GET request to "/api/syntheses/42"
    Then the JSON response should match:
    """
    {
      "id": "42",
      "enabled": true,
      "editable": true,
      "_links": {
        "self": { "href": "/api/syntheses/42" },
        "elements": { "href": "/api/syntheses/42/elements" }
      },
      "elements": [
        {
          "id": "43",
          "title": "Je suis un élément",
          "_links": {
            "self": { "href": "/api/syntheses/42/elements/43" },
            "divide": { "href": "/api/syntheses/42/elements/43/divisions" },
            "history": { "href": "/api/syntheses/42/elements/43/history" }
          }
        }
      ]
    }
    """

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
    And the JSON response should match:
    """
    {
      "id": @string@,
      "enabled": true,
      "editable": true,
      "elements": [],
      "_links": {
        "self": { "href": "@string@.startsWith('/api/syntheses/')" },
        "elements": { "href": "@string@.startsWith('/api/syntheses/').endsWith('/elements')" }
      }
    }
    """

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
  Scenario: API client wants to create a synthesis from a consultation step
    Given I am logged in to api as admin
    And I send a POST request to "/api/syntheses/from-consultation-step/2" with json:
    """
    {
      "enabled": true
    }
    """
    Then the JSON response status code should be 201
    And the JSON response should match:
    """
    {
      "id": @string@,
      "enabled": true,
      "editable": true,
      "elements": [
        {
            "id": @string@,
            "title": "Le problème constaté",
            "_links": {
              "self": { "href": "@string@.startsWith('/api/syntheses/').contains('/elements')" },
              "divide": { "href": "@string@.startsWith('/api/syntheses/').contains('/elements/').endsWith('/divisions')" },
              "history": { "href": "@string@.startsWith('/api/syntheses/').contains('/elements/').endsWith('/history')" }
            }
        },
        {
          "id": @string@,
          "title": "Opinion 52",
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": "Arguments pour",
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": "Arguments contre",
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": @null@,
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": "Les causes",
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": "Opinion 51",
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": "Arguments pour",
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": "Arguments contre",
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": @null@,
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": @null@,
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": "Opinion 53",
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": "Arguments pour",
          "_links": "@*@"
        },
        {
          "id": @string@,
          "title": "Arguments contre",
          "_links": "@*@"
        }
      ],
      "_links": {
        "self": { "href": "@string@.startsWith('/api/syntheses/')" },
        "elements": { "href": "@string@.startsWith('/api/syntheses/').endsWith('/elements')" }
      }
    }
    """

  @database
  Scenario: API client wants to update a synthesis
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a PUT request to "/api/syntheses/42" with json:
    """
    {
      "enabled": false
    }
    """
    Then the JSON response status code should be 200
    And the JSON response should match:
    """
    {
      "id": "42",
      "enabled": false,
      "editable": true,
      "elements": [
        {
          "id": "43",
          "title": "Je suis un élément",
          "_links": {
            "self": { "href": "/api/syntheses/42/elements/43" },
            "divide": { "href": "/api/syntheses/42/elements/43/divisions" },
            "history": { "href": "/api/syntheses/42/elements/43/history" }
          }
        }
      ],
      "_links": {
        "self": { "href": "/api/syntheses/42" },
        "elements": { "href": "/api/syntheses/42/elements" }
      }
    }
    """

  @database
  Scenario: Non admin API client wants to update a synthesis
    Given I am logged in to api as user
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a PUT request to "/api/syntheses/42" with json:
    """
    {
      "enabled": false
    }
    """
    Then the JSON response status code should be 403

  @database
  Scenario: Anonymous API client wants to update a synthesis
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I send a PUT request to "/api/syntheses/42" with json:
    """
    {
      "enabled": false
    }
    """
    Then the JSON response status code should be 401

  @database
  Scenario: API client wants to get synthesis elements
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a GET request to "/api/syntheses/42/elements?type=all"
    Then the JSON response should match:
    """
    [
      {
        "has_linked_data": false,
        "id": "43",
        "enabled": true,
        "created_at": "@string@.isDateTime()",
        "updated_at": "@string@.isDateTime()",
        "archived": false,
        "author": {
          "display_name": "sfavot",
          "unique_id": "sfavot",
          "media": {
            "url": @string@
          },
          "_links": {
            "profile": @string@
          }
        },
        "parent": @null@,
        "children": [],
        "display_type": "folder",
        "title": "Je suis un élément",
        "body": "blabla",
        "notation": 4,
        "votes": {"-1": 21, "0":12, "1": 43},
        "linked_data_creation": @null@,
        "_links": {
          "self": { "href": "/api/syntheses/42/elements/43" },
          "divide": { "href": "/api/syntheses/42/elements/43/divisions" },
          "history": { "href": "/api/syntheses/42/elements/43/history" }
        }
      }
    ]
    """

  @database
  Scenario: API client wants to get synthesis elements count
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a GET request to "/api/syntheses/42/elements/count?type=all"
    Then the JSON response should match:
    """
    {"count": "1"}
    """

  @database
  Scenario: API client wants to get new synthesis elements
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I create an element in synthesis 42 with values:
      | id       | 44   |
      | archived | true |
    And I send a GET request to "/api/syntheses/42/elements?type=new"
    Then the JSON response should match:
    """
    [
      {
        "has_linked_data": false,
        "id": "43",
        "enabled": true,
        "created_at": "@string@.isDateTime()",
        "updated_at": "@string@.isDateTime()",
        "archived": false,
        "author": {
          "display_name": "sfavot",
          "unique_id": "sfavot",
          "media": {
            "url": @string@
          },
          "_links": {
            "profile": @string@
          }
        },
        "parent": @null@,
        "children": [],
        "display_type": "folder",
        "title": "Je suis un élément",
        "body": "blabla",
        "notation": 4,
        "votes": {"-1": 21, "0":12, "1": 43},
        "linked_data_creation": @null@,
        "_links": {
          "self": { "href": "/api/syntheses/42/elements/43" },
          "divide": { "href": "/api/syntheses/42/elements/43/divisions" },
          "history": { "href": "/api/syntheses/42/elements/43/history" }
        }
      }
    ]
    """

  @database
  Scenario: API client wants to get new synthesis elements count
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I create an element in synthesis 42 with values:
      | id       | 44   |
      | archived | true |
    And I send a GET request to "/api/syntheses/42/elements/count?type=new"
    Then the JSON response should match:
    """
    {"count": "1"}
    """

  @database
  Scenario: API client wants to get archived synthesis elements
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I create an element in synthesis 42 with values:
      | id       | 44   |
      | archived | true |
    And I send a GET request to "/api/syntheses/42/elements?type=archived"
    Then the JSON response should match:
    """
    [
      {
        "has_linked_data": false,
        "id": "44",
        "enabled": true,
        "created_at": "@string@.isDateTime()",
        "updated_at": "@string@.isDateTime()",
        "archived": true,
        "author": @null@,
        "parent": @null@,
        "children": [],
        "display_type": "folder",
        "title": @null@,
        "body": "blabla",
        "notation": @null@,
        "votes": [],
        "linked_data_creation": @null@,
        "_links": {
          "self": { "href": "/api/syntheses/42/elements/44" },
          "divide": { "href": "/api/syntheses/42/elements/44/divisions" },
          "history": { "href": "/api/syntheses/42/elements/44/history" }
        }
      }
    ]
    """

  @database
  Scenario: API client wants to get archived synthesis elements count
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I create an element in synthesis 42 with values:
      | id       | 44   |
      | archived | true |
    And I send a GET request to "/api/syntheses/42/elements/count?type=archived"
    Then the JSON response should match:
    """
    {"count": "1"}
    """

  @database
  Scenario: API client wants to get unpublished synthesis elements
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I create an element in synthesis 42 with values:
      | id       | 44   |
      | enabled | false |
    And I send a GET request to "/api/syntheses/42/elements?type=unpublished"
    Then the JSON response should match:
    """
    [
      {
        "has_linked_data": false,
        "id": "44",
        "enabled": false,
        "created_at": "@string@.isDateTime()",
        "updated_at": "@string@.isDateTime()",
        "archived": false,
        "author": @null@,
        "parent": @null@,
        "children": [],
        "display_type": "folder",
        "title": @null@,
        "body": "blabla",
        "notation": @null@,
        "votes": [],
        "linked_data_creation": @null@,
        "_links": {
          "self": { "href": "/api/syntheses/42/elements/44" },
          "divide": { "href": "/api/syntheses/42/elements/44/divisions" },
          "history": { "href": "/api/syntheses/42/elements/44/history" }
        }
      }
    ]
    """

  @database
  Scenario: API client wants to get unpublished synthesis elements count
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I create an element in synthesis 42 with values:
      | id       | 44   |
      | enabled | false |
    And I send a GET request to "/api/syntheses/42/elements/count?type=unpublished"
    Then the JSON response should match:
    """
    {"count": "1"}
    """

  @database
  Scenario: API client wants to get root synthesis elements
    Given I am logged in to api as admin
    And there is a synthesis with id "48" based on consultation step 2
    And I send a GET request to "/api/syntheses/48/elements?type=root"
    Then the JSON response should match:
    """
    [
      {
        "has_linked_data": true,
        "id": @string@,
        "enabled": true,
        "created_at": "@string@.isDateTime()",
        "updated_at": "@string@.isDateTime()",
        "archived": false,
        "author": @...@,
        "parent": @null@,
        "children": [
          @...@
        ],
        "display_type": "folder",
        "title": "Le problème constaté",
        "body": "blabla",
        "notation": @null@,
        "votes": [],
        "linked_data_creation": "@string@.isDateTime()",
        "_links": {
          "self": { "href": "@string@.startsWith('/api/syntheses/48/elements/')" },
          "divide": { "href": "@string@.startsWith('/api/syntheses/48/elements/').endsWith('/divisions')" },
          "history": { "href": "@string@.startsWith('/api/syntheses/48/elements/').endsWith('/history')" }
        }
      },
      {
        "has_linked_data": true,
        "id": @string@,
        "enabled": true,
        "created_at": "@string@.isDateTime()",
        "updated_at": "@string@.isDateTime()",
        "archived": false,
        "author": @...@,
        "parent": @null@,
        "children": [
          @...@
        ],
        "display_type": "folder",
        "title": "Les causes",
        "body": "blabla",
        "notation": @null@,
        "votes": [],
        "linked_data_creation": "@string@.isDateTime()",
        "_links": {
          "self": { "href": "@string@.startsWith('/api/syntheses/48/elements/')" },
          "divide": { "href": "@string@.startsWith('/api/syntheses/48/elements/').endsWith('/divisions')" },
          "history": { "href": "@string@.startsWith('/api/syntheses/48/elements/').endsWith('/history')" }
        }
      }
    ]
    """

  @database
  Scenario: API client wants to get root synthesis elements count
    Given I am logged in to api as admin
    And there is a synthesis with id "48" based on consultation step 2
    And I send a GET request to "/api/syntheses/48/elements/count?type=root"
    Then the JSON response should match:
    """
    {"count": "2"}
    """

  @database
  Scenario: API client wants to get a synthesis element
    Given there is a synthesis with id "42" and elements:
      | 43 |
    And I send a GET request to "/api/syntheses/42/elements/43"
    Then the JSON response should match:
    """
    {
      "has_linked_data": false,
      "id": "43",
      "enabled": true,
      "created_at": "@string@.isDateTime()",
      "updated_at": "@string@.isDateTime()",
      "archived": false,
      "author": {
        "display_name": "sfavot",
        "unique_id": "sfavot",
        "media": {
          "url": @string@
        },
        "_links": {
          "profile": @string@
        }
      },
      "parent": @null@,
      "children": [],
      "display_type": "folder",
      "title": "Je suis un élément",
      "body": "blabla",
      "notation": 4,
      "votes": {"-1": 21, "0":12, "1": 43},
      "linked_data_creation": @null@,
      "_links": {
        "self": { "href": "/api/syntheses/42/elements/43" },
        "divide": { "href": "/api/syntheses/42/elements/43/divisions" },
        "history": { "href": "/api/syntheses/42/elements/43/history" }
      }
    }
    """

  @database
  Scenario: API client wants to create a synthesis element
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a POST request to "/api/syntheses/42/elements" with json:
    """
    {
      "title": "Coucou, je suis un élément.",
      "body": "blabla",
      "notation": 5
    }
    """
    Then the JSON response status code should be 201
    And the JSON response should match:
    """
    {
      "has_linked_data": false,
      "id": @string@,
      "enabled": true,
      "created_at": "@string@.isDateTime()",
      "updated_at": "@string@.isDateTime()",
      "archived": false,
      "author": @null@,
      "parent": @null@,
      "children": [],
      "display_type": "folder",
      "title": "Coucou, je suis un élément.",
      "body": "blabla",
      "notation": 5,
      "votes": [],
      "linked_data_creation": @null@,
      "_links": {
        "self": { "href": "@string@.startsWith('/api/syntheses/42/elements/')" },
        "divide": { "href": "@string@.startsWith('/api/syntheses/42/elements/').endsWith('/divisions')" },
        "history": { "href": "@string@.startsWith('/api/syntheses/42/elements/').endsWith('/history')" }
      }
    }
    """
    And there should be a create log on response element with username "admin"

  @database
  Scenario: Non admin API client wants to create a synthesis element
    Given I am logged in to api as user
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a POST request to "/api/syntheses/42/elements" with json:
    """
    {
      "title": "Coucou, je suis un élément.",
      "body": "blabla",
      "notation": 5
    }
    """
    Then the JSON response status code should be 403

  @database
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
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
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
      "has_linked_data": false,
      "id": "43",
      "enabled": true,
      "created_at": "@string@.isDateTime()",
      "updated_at": "@string@.isDateTime()",
      "archived": false,
      "author": {
        "display_name": "sfavot",
        "unique_id": "sfavot",
        "media": {
          "url": @string@
        },
        "_links": {
          "profile": @string@
        }
      },
      "parent": @null@,
      "children": [],
      "display_type": "folder",
      "title": "Je suis un élément",
      "body": "blabla",
      "notation": 2,
      "votes": {"-1": 21, "0":12, "1": 43},
      "linked_data_creation": @null@,
      "_links": {
        "self": { "href": "/api/syntheses/42/elements/43" },
        "divide": { "href": "/api/syntheses/42/elements/43/divisions" },
        "history": { "href": "/api/syntheses/42/elements/43/history" }
      }
    }
    """

  @database
  Scenario: Non admin API client wants to update a synthesis element
    Given I am logged in to api as user
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a PUT request to "/api/syntheses/42/elements/43" with json:
    """
    {
      "enabled": true,
      "notation": 2
    }
    """
    Then the JSON response status code should be 403

  @database
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
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
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
    Then the JSON response status code should be 201
    And there should be a log on element 43 with sentence "admin a divisé l'élément 43"

  @database
  Scenario: Non admin API client wants to divide a synthesis element
    Given I am logged in to api as user
    And there is a synthesis with id "42" and elements:
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
    Then the JSON response status code should be 403

  @database
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

  @database
  Scenario: API client wants to get a synthesis element history
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a GET request to "/api/syntheses/42/elements/43/history"
    Then the JSON response should match:
    """
    [
      {
        "id": @integer@,
        "action": "update",
        "logged_at": "@string@.isDateTime()",
        "version": 2,
        "sentences": [
          " a mis à jour l'élément 43"
        ]
      },
      {
        "id": @integer@,
        "action": "create",
        "logged_at": "@string@.isDateTime()",
        "version": 1,
        "sentences": [
          " a créé l'élément 43"
        ]
      }
    ]
    """

  @database
  Scenario: After updating an element, there should be an 'update' log
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a PUT request to "/api/syntheses/42/elements/43" with json:
    """
    {
      "title": "Coucou, je suis un élément avec un titre modifié."
    }
    """
    Then there should be a log on element 43 with sentence "admin a mis à jour l'élément 43"

  @database
  Scenario: After changing an element's parent, there should be a 'move' log
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I create an element in synthesis 42 with values:
      | id       | 47                          |
    And I send a PUT request to "/api/syntheses/42/elements/43" with json:
    """
    {
      "parent": 47
    }
    """
    Then there should be a log on element 43 with sentence "admin a déplacé l'élément 43"

  @database
  Scenario: After publishing an element, there should be a 'publish' log
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I create an element in synthesis 42 with values:
      | id       | 47                          |
      | enabled  | false                       |
    And I send a PUT request to "/api/syntheses/42/elements/47" with json:
    """
    {
      "enabled": true
    }
    """
    Then there should be a log on element 47 with sentence "admin a publié l'élément 47"

  @database
  Scenario: After unpublishing an element, there should be an 'unpublish' log
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a PUT request to "/api/syntheses/42/elements/43" with json:
    """
    {
      "enabled": false
    }
    """
    Then there should be a log on element 43 with sentence "admin a dépublié l'élément 43"

  @database
  Scenario: After archiving an element, there should be an 'archive' log
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a PUT request to "/api/syntheses/42/elements/43" with json:
    """
    {
      "archived": true
    }
    """
    Then there should be a log on element 43 with sentence "admin a marqué l'élément 43 comme traité"

  @database
  Scenario: After noting an element, there should be a 'note' log
    Given I am logged in to api as admin
    And there is a synthesis with id "42" and elements:
      | 43 |
    And I send a PUT request to "/api/syntheses/42/elements/43" with json:
    """
    {
      "notation": 1
    }
    """
    Then there should be a log on element 43 with sentence "admin a modifié la note de l'élément 43"

  @database
  Scenario: After updating an opinion, I want to get the updated synthesis
    Given there is a synthesis with id "48" based on consultation step 2
    And I do nothing for 2 seconds
    When I update opinion 51 with values:
      | title | Je suis le nouveau titre |
    And I send a GET request to "api/syntheses/48/updated"
    Then the JSON response should match:
    """
    {
      "id": "48",
      "enabled": true,
      "editable": true,
      "elements": [
        @...@,
        {
          "id": @string@,
          "title": "Je suis le nouveau titre",
          "_links": {
            "self": { "href": "@string@.startsWith('/api/syntheses/48/elements/')" },
            "divide": { "href": "@string@.startsWith('/api/syntheses/48/elements/').endsWith('/divisions')" },
            "history": { "href": "@string@.startsWith('/api/syntheses/48/elements/').endsWith('/history')" }
          }
        },
        @...@
      ],
      "_links": {
        "self": { "href": "/api/syntheses/48" },
        "elements": { "href": "/api/syntheses/48/elements" }
      }
    }
    """
