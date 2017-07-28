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
         contributions {
           id
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
            ],
            "contributions": [
              {
                "id": @string@
              },
              @...@
            ]
          },
          @...@
        ]
      }
    }
    """

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
      votesCountOk
      votesCountNok
      votesCountMitige
      votesCount
      versionsCount
      connectionsCount
      sourcesCount
      argumentsCount
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
              "id": "51",
              "url": "http:\/\/capco.test\/consultations\/strategie-technologique-de-l-etat-et-services-publics\/consultation\/collecte-des-avis-pour-une-meilleur-strategie\/opinions\/les-causes-2\/opinion-51",
              "title": "Opinion 51",
              "createdAt": @string@,
              "updatedAt": @string@,
              "votesCountOk": 0,
              "votesCountNok": 0,
              "votesCountMitige": 0,
              "votesCount": 0,
              "versionsCount": 1,
              "connectionsCount": 0,
              "sourcesCount": 0,
              "argumentsCount": 2,
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
