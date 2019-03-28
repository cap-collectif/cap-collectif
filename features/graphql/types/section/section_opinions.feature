@section
Feature: Opinion types

@read-only
Scenario: GraphQL client wants to list consultations
  When I send a GraphQL request:
  """
  query OpinionListQuery {
    node(id: "opinionType12") {
      ... on Section {
        opinions(limit: 5) {
          ...Opinion_opinion
          id
        }
      }
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
        "node": {
        "opinions":[
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
  }
  """
