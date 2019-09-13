@consultations
Feature: Consultations

Scenario: GraphQL client wants to list consultations
  When I send a GraphQL request:
  """
  {
    consultations {
       id
       title
       contribuable
       sections {
         title
       }
     }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "consultations": [
        {
          "id": @string@,
          "title": @string@,
          "contribuable": @boolean@,
          "sections": [
            {
              "title": @string@
            },
            @...@
          ]
        },
        @...@
      ]
    }
  }
  """

Scenario: GraphQL client wants to list contributions in a consultation
  When I send a GraphQL request:
  """
  query {
     consultations(id: "Q29uc3VsdGF0aW9uOlBKTA==") {
      id
      title
      contributions(first: 5, orderBy: {field: VOTE_COUNT, direction: DESC}) {
        totalCount
        edges {
          cursor
          node {
            ... on Opinion {
              title
              pinned
            }
          }
        }
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
  "data": {
    "consultations": [
      {
        "id": "Q29uc3VsdGF0aW9uOlBKTA==",
        "title": "Projet de loi",
        "contributions": {
          "totalCount": 79,
          "edges": [
            {
              "cursor": @string@,
              "node": {
                "title": @string@,
                "pinned": @boolean@
              }
            },
            @...@
          ]
        }
      }
    ]
  }
  }
  """

Scenario: GraphQL client wants to list contributions in a consultation including trashed ones
  When I send a GraphQL request:
  """
  query {
     consultations(id: "Q29uc3VsdGF0aW9uOlBKTA==") {
      id
      title
      contributions(first: 5, orderBy: {field: VOTE_COUNT, direction: DESC}, includeTrashed: true) {
        totalCount
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
  "data": {
    "consultations": [
      {
        "id": "Q29uc3VsdGF0aW9uOlBKTA==",
        "title": "Projet de loi",
        "contributions": {
          "totalCount": 79
        }
      }
    ]
  }
  }
  """

Scenario: GraphQL client wants to list contributions in a section
  When I send a GraphQL request:
  """
  query {
    section: node(id: "opinionType5") {
      ... on Section {
        contributionConnection(first: 5, orderBy: {field: VOTE_COUNT, direction: DESC}) {
          totalCount
          edges {
            cursor
            node {
              ... on Opinion {
                title
              }
            }
          }
        }
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
  "data": {
    "section": {
      "contributionConnection": {
        "totalCount": @integer@,
        "edges": [
          {
            "cursor": @string@,
            "node": {
              "title": @string@
            }
          },
          @...@
        ]
      }
    }
  }
  }
  """
