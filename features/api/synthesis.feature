@synthesis
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
      "elements": @array@,
      "displayRules": {
        "level": @integer@
      },
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
          "history": { "href": "/api/syntheses/42/elements/43/history" }
        }
      }
    ],
    "displayRules": {
      "level": 0
    }
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
    "displayRules": {
      "level": 0
    },
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
  And I send a POST request to "/api/syntheses/from-consultation-step/cstep2" with json:
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
        "title": "synthesis.consultation_step.arguments.pros",
        "_links": "@*@"
      },
      {
        "id": @string@,
        "title": "synthesis.consultation_step.arguments.cons",
        "_links": "@*@"
      },
      @...@
    ],
    "displayRules": {
      "level": 0
    },
    "_links": {
      "self": { "href": "@string@.startsWith('/api/syntheses/')" },
      "elements": { "href": "@string@.startsWith('/api/syntheses/').endsWith('/elements')" }
    }
  }
  """

@database
Scenario: API client wants to get elements count from consultation step synthesis
  Given I am logged in to api as admin
  And there is a synthesis with id "48" based on consultation step "cstep2"
  And I send a GET request to "/api/syntheses/48/elements/count?type=all"
  Then the JSON response should match:
  """
  {"count": @integer@}
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
          "history": { "href": "/api/syntheses/42/elements/43/history" }
        }
      }
    ],
    "displayRules": {
      "level": 0
    },
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
  {
    "elements": [
      {
        "hasLinkedData": false,
        "id": "43",
        "published": false,
        "createdAt": "@string@.isDateTime()",
        "updatedAt": "@string@.isDateTime()",
        "archived": false,
        "author": {
          "displayName": "sfavot",
          "uniqueId": "sfavot",
          "isAdmin": true,
          "media": {},
          "vip": true,
          "_links": {
            "settings": @string@
          }
        },
        "path": "Je suis un élément-43",
        "displayType": "folder",
        "title": "Je suis un élément",
        "body": "blabla",
        "description": @null@,
        "notation": 4,
        "linkedDataCreation": @null@,
        "_links": {
          "self": { "href": "/api/syntheses/42/elements/43" },
          "history": { "href": "/api/syntheses/42/elements/43/history" }
        }
      }
    ],
    "count": 1
  }
  """

@database
Scenario: API client wants to get synthesis elements count
  Given I am logged in to api as admin
  And there is a synthesis with id "42" and elements:
    | 43 |
  And I send a GET request to "/api/syntheses/42/elements/count?type=all"
  Then the JSON response should match:
  """
  {"count": 1}
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
  {
    "elements": [
      {
        "hasLinkedData": false,
        "id": "43",
        "published": false,
        "createdAt": "@string@.isDateTime()",
        "updatedAt": "@string@.isDateTime()",
        "archived": false,
        "author": {
          "displayName": "sfavot",
          "uniqueId": "sfavot",
          "isAdmin": true,
          "media": {},
          "vip": true,
          "_links": {
            "settings": @string@
          }
        },
        "path": "Je suis un élément-43",
        "displayType": "folder",
        "title": "Je suis un élément",
        "body": "blabla",
        "description": @null@,
        "notation": 4,
        "linkedDataCreation": @null@,
        "_links": {
          "self": { "href": "/api/syntheses/42/elements/43" },
          "history": { "href": "/api/syntheses/42/elements/43/history" }
        }
      }
    ],
    "count": 1
  }
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
  {"count": 1}
  """

@database
Scenario: API client wants to get archived synthesis elements
  Given I am logged in to api as admin
  And there is a synthesis with id "42" and elements:
    | 43 |
  And I create an element in synthesis 42 with values:
    | id       | 44   |
    | archived | true |
  And I send a GET request to "/api/syntheses/42/elements?type=archived"
  Then the JSON response should match:
  """
  {
    "elements": [
      {
        "hasLinkedData": false,
        "id": "44",
        "published": false,
        "createdAt": "@string@.isDateTime()",
        "updatedAt": "@string@.isDateTime()",
        "archived": true,
        "author": @null@,
        "path": "-44",
        "displayType": "folder",
        "title": @null@,
        "body": "blabla",
        "description": @null@,
        "notation": @null@,
        "linkedDataCreation": @null@,
        "_links": {
          "self": { "href": "/api/syntheses/42/elements/44" },
          "history": { "href": "/api/syntheses/42/elements/44/history" }
        }
      }
    ],
    "count": 1
  }
  """

@database
Scenario: API client wants to get archived synthesis elements count
  Given I am logged in to api as admin
  And there is a synthesis with id "42" and elements:
    | 43 |
  And I create an element in synthesis 42 with values:
    | id       | 44   |
    | archived | true |
  And I send a GET request to "/api/syntheses/42/elements/count?type=archived"
  Then the JSON response should match:
  """
  {"count": 1}
  """

@database
Scenario: API client wants to get unpublished synthesis elements
  Given I am logged in to api as admin
  And there is a synthesis with id "42" and elements:
    | 43 |
  And I create an element in synthesis 42 with values:
    | id        | 44    |
    | archived  | true  |
    | published | false |
  And I send a GET request to "/api/syntheses/42/elements?type=unpublished"
  Then the JSON response should match:
  """
  {
    "elements": [
      {
        "hasLinkedData": false,
        "id": "44",
        "published": false,
        "createdAt": "@string@.isDateTime()",
        "updatedAt": "@string@.isDateTime()",
        "archived": true,
        "author": @null@,
        "path": "-44",
        "displayType": "folder",
        "title": @null@,
        "body": "blabla",
        "description": @null@,
        "notation": @null@,
        "linkedDataCreation": @null@,
        "_links": {
          "self": { "href": "/api/syntheses/42/elements/44" },
          "history": { "href": "/api/syntheses/42/elements/44/history" }
        }
      }
    ],
    "count": 1
  }
  """

@database
Scenario: API client wants to get unpublished synthesis elements count
  Given I am logged in to api as admin
  And there is a synthesis with id "42" and elements:
    | 43 |
  And I create an element in synthesis 42 with values:
    | id        | 44    |
    | archived  | true  |
    | published | false |
  And I send a GET request to "/api/syntheses/42/elements/count?type=unpublished"
  Then the JSON response should match:
  """
  {"count": 1}
  """

@database
Scenario: Anonymous wants to get synthesis elements published tree
  Given there is a synthesis with id "48" based on consultation step "cstep2"
  And I send a GET request to "/api/syntheses/48/elements/tree?type=published"
  Then the JSON response should match:
  """
  [
    {
      "id": @string@,
      "level": 0,
      "path": @string@,
      "displayType": "folder",
      "title": "Le problème constaté",
      "body": @null@,
      "description": @null@,
      "childrenCount": 1,
      "votes": [],
      "published": true,
      "publishedChildrenCount": 0,
      "publishedParentChildrenCount": 0,
      "childrenScore": 0,
      "parentChildrenScore": 0,
      "childrenElementsNb": 0,
      "parentChildrenElementsNb": 0,
      "linkedDataUrl": "",
      "subtitle": @...@,
      "authorName": @...@,
      "linkedDataCreation": @string@,
      "children": @...@
    },
    {
      "id": @string@,
      "level": 0,
      "path": @string@,
      "displayType": "folder",
      "title": "Les causes",
      "body": @null@,
      "description": @null@,
      "childrenCount": 0,
      "votes": [],
      "published": true,
      "publishedChildrenCount": 0,
      "publishedParentChildrenCount": 0,
      "childrenScore": 0,
      "parentChildrenScore": 0,
      "childrenElementsNb": 0,
      "parentChildrenElementsNb": 0,
      "linkedDataUrl": "",
      "subtitle": @...@,
      "authorName": @...@,
      "linkedDataCreation": @string@,
      "children": []
    }
  ]
  """

@database
Scenario: API client wants to get not ignored synthesis elements tree
  Given I am logged in to api as admin
  And there is a synthesis with id "48" based on consultation step "cstep2"
  And I send a GET request to "/api/syntheses/48/elements/tree?type=notIgnored"
  Then the JSON response should match:
  """
  [
    {
      "id": @string@,
      "level": 0,
      "path": @string@,
      "displayType": @string@,
      "title": @string@,
      "body": @null@,
      "published": true,
      "description": @null@,
      "childrenCount": @integer@,
      "childrenScore": @integer@,
      "childrenElementsNb": @integer@,
      "parentChildrenScore": @integer@,
      "parentChildrenElementsNb": @integer@,
      "publishedParentChildrenCount": @integer@,
      "publishedChildrenCount": @integer@,
      "children": [
        {
          "id": @string@,
          "level": 1,
          "path": @string@,
          "displayType": @string@,
          "title": @string@,
          "body": @string@,
          "published": @boolean@,
          "description": @null@,
          "childrenCount": @integer@,
          "childrenScore": @integer@,
          "childrenElementsNb": @integer@,
          "parentChildrenScore": @integer@,
          "parentChildrenElementsNb": @integer@,
          "publishedParentChildrenCount": @integer@,
          "publishedChildrenCount": @integer@,
          "children": [@...@]
        }
      ]
    },
    @...@
  ]
  """

@database
Scenario: API client wants to get synthesis elements tree
  Given I am logged in to api as admin
  And there is a synthesis with id "48" based on consultation step "cstep2"
  And I send a GET request to "/api/syntheses/48/elements/tree?type=all"
  Then the JSON response should match:
  """
  [
    {
      "id": @string@,
      "level": 0,
      "path": @string@,
      "displayType": @string@,
      "title": @string@,
      "body": @null@,
      "description": @null@,
      "published": true,
      "childrenCount": @integer@,
      "childrenScore": @integer@,
      "childrenElementsNb": @integer@,
      "parentChildrenScore": @integer@,
      "parentChildrenElementsNb": @integer@,
      "publishedParentChildrenCount": @integer@,
      "publishedChildrenCount": @integer@,
      "children": [
        {
          "id": @string@,
          "level": 1,
          "path": @string@,
          "displayType": @string@,
          "title": @string@,
          "published": @boolean@,
          "body": @string@,
          "description": @null@,
          "childrenCount": @integer@,
          "childrenScore": @integer@,
          "childrenElementsNb": @integer@,
          "parentChildrenScore": @integer@,
          "parentChildrenElementsNb": @integer@,
          "publishedParentChildrenCount": @integer@,
          "publishedChildrenCount": @integer@,
          "children": [@...@]
        }
      ]
    },
    @...@
  ]
  """

@database
Scenario: API client wants to get a synthesis element that is not published
  Given there is a synthesis with id "42" and elements:
    | 43 |
  And I send a GET request to "/api/syntheses/42/elements/43"
  Then the JSON response status code should be 401

@database
Scenario: API client wants to get a synthesis element that is published
  Given there is a synthesis with id "42" and published elements:
    | 43 |
  And I send a GET request to "/api/syntheses/42/elements/43"
  Then the JSON response should match:
  """
  {
    "childrenCount": 0,
    "hasLinkedData": false,
    "id": "43",
    "published": true,
    "createdAt": "@string@.isDateTime()",
    "updatedAt": "@string@.isDateTime()",
    "archived": false,
    "author": {
      "displayName": "sfavot",
      "uniqueId": "sfavot",
      "isAdmin": true,
      "media": {},
      "vip": true,
      "_links": {
        "settings": @string@
      }
    },
    "originalDivision": @null@,
    "division": @null@,
    "level": 0,
    "path": "Je suis un élément-43",
    "parent": @...@,
    "children": [],
    "displayType": "folder",
    "title": "Je suis un élément",
    "body": "blabla",
    "link": @null@,
    "notation": 4,
    "comment": @null@,
    "votes": {"-1": 21, "0":12, "1": 43},
    "linkedDataCreation": @null@,
    "logs": [
      {
        "id": @integer@,
        "action": "update",
        "loggedAt": "@string@.isDateTime()",
        "version": 2,
        "sentences": [
          "synthesis.logs.sentence.update {\"%author%\":null}"
        ]
      },
      {
        "id": @integer@,
        "action": "create",
        "loggedAt": "@string@.isDateTime()",
        "version": 1,
        "sentences": [
          "synthesis.logs.sentence.create"
        ]
      }
    ],
    "_links": {
      "self": { "href": "/api/syntheses/42/elements/43" },
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
    "notation": 5,
    "archived": true,
    "published": true,
    "parent": "43"
  }
  """
  Then the JSON response status code should be 201
  And the JSON response should match:
  """
  {
    "childrenCount": 0,
    "hasLinkedData": false,
    "id": @string@,
    "published": true,
    "createdAt": "@string@.isDateTime()",
    "updatedAt": "@string@.isDateTime()",
    "archived": true,
    "author": @...@,
    "originalDivision": @null@,
    "division": @null@,
    "path": @string@,
    "children": [],
    "displayType": "folder",
    "title": "Coucou, je suis un élément.",
    "body": "blabla",
    "link": @null@,
    "notation": 5,
    "comment": @null@,
    "votes": [],
    "linkedDataCreation": @null@,
    "logs": @...@,
    "_links": {
      "self": { "href": "@string@.startsWith('/api/syntheses/42/elements/')" },
      "history": { "href": "@string@.startsWith('/api/syntheses/42/elements/').endsWith('/history')" }
    }
  }
  """

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
    "published": true,
    "notation": 2,
    "comment": "Cet argument est vraiment nul !"
  }
  """
  Then the JSON response status code should be 200
  And the JSON response should match:
  """
  {
    "childrenCount": 0,
    "hasLinkedData": false,
    "id": "43",
    "published": true,
    "createdAt": "@string@.isDateTime()",
    "updatedAt": "@string@.isDateTime()",
    "archived": false,
    "author": {
      "displayName": "sfavot",
      "uniqueId": "sfavot",
      "isAdmin": true,
      "media": {},
      "vip": true,
      "_links": {
        "settings": @string@
      }
    },
    "originalDivision": @null@,
    "division": @null@,
    "level": 0,
    "path": "Je suis un élément-43",
    "parent": @...@,
    "children": [],
    "displayType": "folder",
    "title": "Je suis un élément",
    "body": "blabla",
    "link": @null@,
    "notation": 2,
    "comment": "Cet argument est vraiment nul !",
    "votes": {"-1": 21, "0":12, "1": 43},
    "linkedDataCreation": @null@,
    "logs": @...@,
    "_links": {
      "self": { "href": "/api/syntheses/42/elements/43" },
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
    "published": true,
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
    "published": true,
    "notation": 2
  }
  """
  Then the JSON response status code should be 401

@database 
Scenario: API client wants to divide a synthesis element
  Given I am logged in to api as admin
  And there is a synthesis with id "42" and elements:
    | 43 |
  And I send a PUT request to "/api/syntheses/42/elements/43" with json:
  """
  {
    "archived": true,
    "published": false,
    "division": {
      "elements": [
        {
          "title": "Coucou, je suis un élément.",
          "body": "blabla",
          "notation": 5,
          "archived": true,
          "published": true
        },
        {
          "title": "Coucou, je suis un autre élément.",
          "body": "blabla",
          "notation": 3,
          "archived": true,
          "published": true
        },
        {
          "title": "Coucou, je suis le dernier élément.",
          "body": "blabla",
          "notation": 2,
          "archived": true,
          "published": true
        }
      ]
    }
  }
  """
  Then the JSON response status code should be 200
  And the JSON response should match:
  """
  {
    "childrenCount": @integer@,
    "body": @string@,
    "hasLinkedData": @boolean@,
    "id": "43",
    "published": false,
    "createdAt": "@string@.isDateTime()",
    "updatedAt": "@string@.isDateTime()",
    "archived": true,
    "author": @...@,
    "originalDivision": @null@,
    "division": {
      "id": @string@,
      "original_element": @...@,
      "elements": [
        {
          "childrenCount": @integer@,
          "body": @string@,
          "hasLinkedData": false,
          "id": @string@,
          "published": true,
          "createdAt": "@string@.isDateTime()",
          "updatedAt": "@string@.isDateTime()",
          "archived": true,
          "author": @...@,
          "originalDivision": @...@,
          "division": @null@,
          "level": @integer@,
          "path": @string@,
          "parent": @null@,
          "children": @array@,
          "displayType": "contribution",
          "title": "Coucou, je suis un élément.",
          "description": @...@,
          "link": @null@,
          "notation": 5,
          "comment": @...@,
          "votes": @array@,
          "linkedDataCreation": @null@,
          "logs": @array@,
          "_links": {
            "self": { "href": "/api/syntheses/42/elements/43" },
            "history": { "href": "/api/syntheses/42/elements/43/history" }
          }
        },
        @...@
      ]
    },
    "level": @integer@,
    "path": @string@,
    "parent": @null@,
    "children": @array@,
    "displayType": "folder",
    "title": "Je suis un élément",
    "description": @...@,
    "link": @null@,
    "notation": @null@,
    "comment": @...@,
    "votes": {"-1": 21, "0":12, "1": 43},
    "linkedDataCreation": @null@,
    "logs": @array@,
    "_links": {
      "self": { "href": "/api/syntheses/42/elements/43" },
      "history": { "href": "/api/syntheses/42/elements/43/history" }
    }
  }
  """

@database @security
Scenario: Non admin API client wants to divide a synthesis element
  Given I am logged in to api as user
  And there is a synthesis with id "42" and elements:
    | 43 |
  And I send a PUT request to "/api/syntheses/42/elements/43" with json:
  """
  {
    "division": {
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
  }
  """
  Then the JSON response status code should be 403

@database @security
Scenario: Anonymous API client wants to divide a synthesis element
  Given there is a synthesis with id "42" and elements:
    | 43 |
  And I send a PUT request to "/api/syntheses/42/elements/43" with json:
  """
  {
    "division": {
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
      "loggedAt": "@string@.isDateTime()",
      "version": 2,
      "sentences": [
        "synthesis.logs.sentence.update {\"%author%\":null}"
      ]
    },
    {
      "id": @integer@,
      "action": "create",
      "loggedAt": "@string@.isDateTime()",
      "version": 1,
      "sentences": [
        "synthesis.logs.sentence.create {\"%author%\":null}"
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

@database
Scenario: After publishing an element, there should be a 'publish' log
  Given I am logged in to api as admin
  And there is a synthesis with id "42" and elements:
    | 43 |
  And I create an element in synthesis 42 with values:
    | id         | 47                          |
    | published  | false                       |
  And I send a PUT request to "/api/syntheses/42/elements/47" with json:
  """
  {
    "published": true
  }
  """

@database
Scenario: After unpublishing an element, there should be an 'unpublish' log
  Given I am logged in to api as admin
  And there is a synthesis with id "42" and elements:
    | 43 |
  And I create an element in synthesis 42 with values:
    | id        | 47    |
    | published | true |
  And I send a PUT request to "/api/syntheses/42/elements/47" with json:
  """
  {
    "published": false
  }
  """

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

@database
Scenario: After commenting an element, there should be a 'comment' log
  Given I am logged in to api as admin
  And there is a synthesis with id "42" and elements:
    | 43 |
  And I send a PUT request to "/api/syntheses/42/elements/43" with json:
  """
  {
    "comment": "Super contribution !"
  }
  """

@database
Scenario: After updating an opinion, I want to get the updated synthesis
  Given I am logged in to api as admin
  And there is a synthesis with id "48" based on consultation step "cstep2"
  And I wait 2 seconds
  When I update opinion "51" with values:
    | title | Je suis le nouveau titre |
  And I send a GET request to "api/syntheses/48/updated"
  Then the JSON response should match:
  """
  {
    "id": "48",
    "enabled": true,
    "editable": true,
    "displayRules": {
      "level": 0
    },
    "elements": [
      @...@,
      {
        "id": @string@,
        "title": "Je suis le nouveau titre",
        "_links": {
          "self": { "href": "@string@.startsWith('/api/syntheses/48/elements/')" },
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
@database
Scenario: Admin wants to update synthesis display rules
  Given I am logged in to api as admin
  And there is a synthesis with id "42" and elements:
    | 43 |
  And I send a PUT request to "api/syntheses/42/display" with synthesis display rules json
  Then the JSON response status code should be 200
