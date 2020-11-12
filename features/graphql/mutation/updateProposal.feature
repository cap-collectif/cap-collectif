@proposal @update_proposal
Feature: Update a proposal

@database @rabbitmq
Scenario: Admin should be notified if GraphQL user modify his proposal
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          publicationStatus
          updatedAt
        }
      }
    }",
    "variables": {
      "input": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "title": "Achetez un DOP à la madeleine",
        "body": "Grâce à ça, on aura des cheveux qui sentent la madeleine !!!!!!!",
        "responses": [
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": "reponse-1"
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "reponse-3"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media1"]
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": []
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeProposalContent": {
        "proposal": {
          "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
          "title": "Achetez un DOP à la madeleine",
          "body": "Grâce à ça, on aura des cheveux qui sentent la madeleine !!!!!!!",
          "publicationStatus": "PUBLISHED",
          "updatedAt":"@string@.isDateTime()"
        }
      }
    }
  }
  """
  Then the queue associated to "proposal_update" producer has messages below:
  | 0 | {"proposalId": "proposal2"} |

@database
Scenario: GraphQL client wants to edit his proposal
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          publicationStatus
          updatedAt
        }
      }
    }",
    "variables": {
      "input": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "title": "Acheter un sauna par personne pour Capco",
        "body": "Avec tout le travail accompli, on mérite bien chacun un (petit) cadeau, donc on a choisi un sauna. JoliCode interdit",
        "responses": [
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": "reponse-1"
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "reponse-3"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media1"]
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": []
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeProposalContent": {
        "proposal": {
          "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
          "title": "Acheter un sauna par personne pour Capco",
          "body": "Avec tout le travail accompli, on mérite bien chacun un (petit) cadeau, donc on a choisi un sauna. JoliCode interdit",
          "publicationStatus": "PUBLISHED",
          "updatedAt":"@string@.isDateTime()"
        }
      }
    }
  }
  """
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          publicationStatus
          updatedAt
          responses {
            question {
              id
            }
            ... on ValueResponse {
              value
            }
            ... on MediaResponse {
              medias {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "title": "New title",
        "body": "New body",
        "category": "pCategory3",
        "responses": [
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "New reponse-3"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media1", "media2"]
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": []
          },
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": "New reponse-1"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "changeProposalContent":{
           "proposal":{
              "id":"UHJvcG9zYWw6cHJvcG9zYWwy",
              "title":"New title",
              "body":"New body",
              "publicationStatus":"PUBLISHED",
              "updatedAt":"@string@.isDateTime()",
              "responses":[
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MzAz"
                    },
                    "value":null
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MQ=="
                    },
                    "value":"New reponse-1"
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246Mw=="
                    },
                    "value":"New reponse-3"
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MTE="
                    },
                    "medias":[
                       {
                          "id":"media1"
                       },
                       {
                          "id":"media2"
                       }
                    ]
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MTI="
                    },
                    "medias":[

                    ]
                 }
              ]
           }
        }
     }
  }
  """

@database
Scenario: Super Admin GraphQL client wants to update a proposal
  Given features themes, districts are enabled
  And I am logged in to graphql as super admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          updatedAt
          author {
            _id
          }
          theme {
            id
          }
          district {
            id
          }
          category {
            id
          }
          responses {
            question {
              id
            }
            ... on ValueResponse {
              value
            }
            ... on MediaResponse {
              medias {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "title": "NewTitle",
        "body": "NewBody",
        "theme": "theme1",
        "author": "VXNlcjp1c2VyQWRtaW4=",
        "district": "district2",
        "category": "pCategory2",
        "responses": [
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media1"]
          },
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": "reponse-1"
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "reponse-3"
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": ["media1"]
          }
        ],
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "changeProposalContent":{
           "proposal":{
              "id":"UHJvcG9zYWw6cHJvcG9zYWwy",
              "title":"NewTitle",
              "body":"NewBody",
              "updatedAt":"@string@.isDateTime()",
              "author":{
                 "_id":"userAdmin"
              },
              "theme":{
                 "id":"theme1"
              },
              "district":{
                 "id":"district2"
              },
              "category":{
                 "id":"pCategory2"
              },
              "responses":[
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MzAz"
                    },
                    "value":null
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MQ=="
                    },
                    "value":"reponse-1"
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246Mw=="
                    },
                    "value":"reponse-3"
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MTE="
                    },
                    "medias":[
                       {
                          "id":"media1"
                       }
                    ]
                 },
                 {
                    "question":{
                       "id":"UXVlc3Rpb246MTI="
                    },
                    "medias":[
                       {
                          "id":"media1"
                       }
                    ]
                 }
              ]
           }
        }
     }
  }
  """

@database
Scenario: GraphQL client wants to edit his proposal without required response
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          publicationStatus
          updatedAt
        }
      }
    }",
    "variables": {
      "input": {
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "responses": [
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": "reponse-1"
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "reponse-3"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": []
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": []
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
  "errors":[{"message":"proposal.missing_required_responses {\"missing\":11}","@*@": "@*@"}],
  "data": { "changeProposalContent": null }
  }
  """

@database
Scenario: Admin GraphQL client wants to update a and published a draft proposal
  Given features themes, districts are enabled
  And I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          draft
          published
          publishedAt
          publicationStatus
          updatedAt
        }
      }
    }",
    "variables": {
      "input": {
        "title": "NewTitle",
        "body": "NewBody",
        "theme": "theme1",
        "author": "VXNlcjp1c2VyQWRtaW4=",
        "district": "district3",
        "draft": false,
        "category": "pCategory2",
        "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
        "responses": [
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": ""
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media10"]
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": ["media10"]
          }
        ],
        "id": "UHJvcG9zYWw6cHJvcG9zYWwyMQ=="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "changeProposalContent":{
           "proposal":{
              "id":"UHJvcG9zYWw6cHJvcG9zYWwyMQ==",
              "title":"NewTitle",
              "body":"NewBody",
              "draft":false,
              "published":true,
              "publishedAt": "@string@.isDateTime()",
              "publicationStatus":"PUBLISHED",
              "updatedAt":"@string@.isDateTime()"
           }
        }
     }
  }
  """

@database
Scenario: GraphQL client try to update a and published a draft proposal
  Given features themes, districts are enabled
  And I am logged in to graphql as user_not_confirmed_with_contributions
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          draft
          publicationStatus
          updatedAt
        }
      }
    }",
    "variables": {
      "input": {
        "title": "NewTitle",
        "body": "NewBody",
        "theme": "theme1",
        "author": "VXNlcjp1c2VyX25vdF9jb25maXJtZWRfd2l0aF9jb250cmlidXRpb25z",
        "district": "district3",
        "draft": false,
        "category": "pCategory2",
        "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
        "responses": [
          {
            "question": "UXVlc3Rpb246MQ==",
            "value": ""
          },
          {
            "question": "UXVlc3Rpb246Mw==",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "UXVlc3Rpb246MTE=",
            "medias": ["media10"]
          },
          {
            "question": "UXVlc3Rpb246MTI=",
            "medias": ["media10"]
          }
        ],
        "id": "UHJvcG9zYWw6cHJvcG9zYWxEcmFmdFdpdGhOb3RDb25maXJtZWRBdXRob3I="
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
   "data":{
      "changeProposalContent":{
         "proposal":{
            "id":"UHJvcG9zYWw6cHJvcG9zYWxEcmFmdFdpdGhOb3RDb25maXJtZWRBdXRob3I=",
            "title":"NewTitle",
            "draft":false,
            "publicationStatus":"UNPUBLISHED",
            "updatedAt":"@string@.isDateTime()"
         }
      }
   }
}
  """

@database
Scenario: GraphQL client try to update his proposal in revision
  Given features themes, districts are enabled
  And I am logged in to graphql as pierre
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: ChangeProposalContentInput!) {
      changeProposalContent(input: $input) {
        proposal {
          id
          title
          body
          updatedAt
          revisions {
            totalCount
            edges {
              node {
                id
                state
                revisedAt
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "address": "[{\"address_components\":[{\"long_name\":\"Vincennes\",\"short_name\":\"Vincennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Val-de-Marne\",\"short_name\":\"Val-de-Marne\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Île-de-France\",\"short_name\":\"IDF\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"94300\",\"short_name\":\"94300\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"94300 Vincennes, France\",\"geometry\":{\"bounds\":{\"south\":48.840891,\"west\":2.418554,\"north\":48.85335800000001,\"east\":2.4579331},\"location\":{\"lat\":48.847759,\"lng\":2.4394969},\"location_type\":\"APPROXIMATE\",\"viewport\":{\"south\":48.840891,\"west\":2.418554,\"north\":48.85335800000001,\"east\":2.4579331}},\"place_id\":\"ChIJTcXqm6Ny5kcRQDeLaMOCCwQ\",\"types\":[\"locality\",\"political\"]}]",
        "body": "<p>Je ne crois pas qu'il y ai de petit ou de moyen projet.</p>",
        "category": "pCategoryIdf3",
        "district": "districtIdf2",
        "draft": false,
        "id": "UHJvcG9zYWw6cHJvcG9zYWxJZGYx",
        "media": null,
        "responses": [
          {
            "question": "UXVlc3Rpb246MTMyOQ==",
            "value": "département"
          },
          {
            "question": "UXVlc3Rpb246MzkxOA==",
            "value": "{\"labels\":[\"Renseigner la présentation de mon Grand Projet\"],\"other\":null}"
          },
          {
            "question": "UXVlc3Rpb246MzUw",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MzA0",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTMzMg==",
            "value": "31/12/2023"
          },
          {
            "question": "UXVlc3Rpb246MTMzMw==",
            "value": "31/12/2030"
          },
          {
            "question": "UXVlc3Rpb246MTMzNA==",
            "value": 160001
          },
          {
            "question": "UXVlc3Rpb246MTMzNQ==",
            "value": 30004
          },
          {
            "question": "UXVlc3Rpb246MzA1",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTMzMA==",
            "value": "123456"
          },
          {
            "question": "UXVlc3Rpb246MzkxOQ==",
            "value": "{\"labels\":[\"Un autre organisme privé\"],\"other\":null}"
          },
          {
            "question": "UXVlc3Rpb246MTMzMQ==",
            "value": "test"
          },
          {
            "question": "UXVlc3Rpb246MzUx",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MzA3",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM2Mg==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM2Mw==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM2NA==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM2NQ==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM2Ng==",
            "value": null
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTIx"
          },
          {
            "question": "UXVlc3Rpb246MTM2Nw==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MzA2",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MzkyMA==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MzkyMQ==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTMzNg==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTMzNw==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTMzOA==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTMzOQ==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM0MA==",
            "value": null
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTIy"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTIz"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTI1"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTI2"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTI3"
          },
          {
            "question": "UXVlc3Rpb246MzkyMg==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM0Mg==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM0Mw==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM0NA==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM0NQ==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM0Ng==",
            "value": null
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTI4"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTI5"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTMw"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTMx"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTMy"
          },
          {
            "question": "UXVlc3Rpb246MTM0Nw==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM0OA==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM0OQ==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM1MA==",
            "value": null
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTMz"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTM1"
          },
          {
            "question": "UXVlc3Rpb246MTM1MQ==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM1Mg==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM1Mw==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM1NA==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM1NQ==",
            "value": null
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTM2"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTM3"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTM4"
          },
          {
            "question": "UXVlc3Rpb246MTM1Ng==",
            "value": null
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTM5"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTQw"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTQx"
          },
          {
            "question": "UXVlc3Rpb246MTM1Nw==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM1OA==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM1OQ==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM2MA==",
            "value": null
          },
          {
            "question": "UXVlc3Rpb246MTM2MQ==",
            "value": null
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTQy"
          },
          {
            "medias": null,
            "question": "UXVlc3Rpb246MTQz"
          }
        ],
        "summary": null,
        "title": "Mon grand projet"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "changeProposalContent":{
           "proposal":{
              "id":"UHJvcG9zYWw6cHJvcG9zYWxJZGYx",
              "title":"Mon grand projet",
              "body":"\u003Cp\u003EJe ne crois pas qu\u0027il y ai de petit ou de moyen projet.\u003C\/p\u003E",
              "updatedAt":"@string@.isDateTime()",
              "revisions":{
                 "totalCount":4,
                 "edges":[
                    {
                       "node":{
                          "id":"UHJvcG9zYWxSZXZpc2lvbjpwcm9wb3NhbFJldmlzaW9uMg==",
                          "state":"REVISED",
                          "revisedAt":"@string@.isDateTime()"
                       }
                    },
                    {
                       "node":{
                          "id":"UHJvcG9zYWxSZXZpc2lvbjpwcm9wb3NhbFJldmlzaW9uRXhwaXJlZA==",
                          "state":"REVISED",
                          "revisedAt":"@string@.isDateTime()"
                       }
                    },
                    {
                       "node":{
                          "id":"UHJvcG9zYWxSZXZpc2lvbjpwcm9wb3NhbFJldmlzaW9uUmV2aXNlZA==",
                          "state":"REVISED",
                          "revisedAt":"@string@.isDateTime()"
                       }
                    },
                    {
                       "node":{
                          "id":"UHJvcG9zYWxSZXZpc2lvbjpwcm9wb3NhbFJldmlzaW9uUmV2aXNlZE5vdEV4cGlyZWQ=",
                          "state":"REVISED",
                          "revisedAt":"@string@.isDateTime()"
                       }
                    }
                 ]
              }
           }
        }
     }
  }
  """
