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

@read-only
Scenario: GraphQL client wants to list consultations
  When I send a GraphQL request:
  """
  query OpinionListQuery {
      contributionsBySection(sectionId: "opinionType12", limit: 5) {
          ...Opinion_opinion
          id
        }
  }
  fragment Opinion_opinion on Opinion {
        id
        url
        title
        createdAt
        updatedAt
        author {
          vip
          displayName
          media {
            url
            id
          }
          id
        }
        section {
          title
          versionable
          linkable
          sourceable
          voteWidgetType
          id
        }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "contributionsBySection":[
           {
              "id": "opinion51",
              "url": "https://capco.test/consultations/strategie-technologique-de-letat-et-services-publics/consultation/collecte-des-avis-pour-une-meilleur-strategie/opinions/les-causes/opinion-51",
              "title": "Opinion 51",
              "createdAt": @string@,
              "updatedAt": null,
              "author": {
                 "vip": false,
                 "displayName": "user",
                 "media": null,
                 "id": @string@
              },
              "section": {
                 "title": "Les causes",
                 "versionable": true,
                 "linkable": false,
                 "sourceable": true,
                 "voteWidgetType": 2,
                 "id": @string@
              }
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
     consultations(id: "Q29uc3VsdGF0aW9uOmNzdGVwNQ==") {
      id
      title
      contributionConnection(first: 5, orderBy: {field: VOTE_COUNT, direction: DESC}) {
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
        "id": "Q29uc3VsdGF0aW9uOmNzdGVwNQ==",
        "title": "Elaboration de la Loi",
        "contributionConnection": {
          "totalCount": 11,
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
     consultations(id: "Q29uc3VsdGF0aW9uOmNzdGVwNQ==") {
      id
      title
      contributionConnection(first: 5, orderBy: {field: VOTE_COUNT, direction: DESC}, includeTrashed: true) {
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
        "id": "Q29uc3VsdGF0aW9uOmNzdGVwNQ==",
        "title": "Elaboration de la Loi",
        "contributionConnection": {
          "totalCount": 18
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
