@updateProposalForm @admin
Feature: Update Proposal Form

@database
Scenario: GraphQL client wants to update a proposal form
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
          updateProposalForm(input: $input) {
            proposalForm {
              id
              title
              titleHelpText
              allowAknowledge
              description
              descriptionHelpText
              summaryHelpText
              illustrationHelpText
              usingThemes
              themeMandatory
              themeHelpText
              usingDistrict
              districtMandatory
              districtHelpText
              usingCategories
              categoryMandatory
              categoryHelpText
              usingAddress
              addressHelpText
              usingDescription
              usingSummary
              usingIllustration
              descriptionMandatory
              objectType
              proposalInAZoneRequired
              mapCenter {
                lat
                lng
              }
              zoomMap
              commentable
              costable
              categories(order: ALPHABETICAL) {
                id
                name
                color
                categoryImage {
                  id
                  image {
                    url
                    id
                    name
                  }
                }
              }
              districts {
                id
                name (locale: FR_FR)
                geojson
                displayedOnMap
              }
              questions {
                id
                helpText
                private
                required
                title
                type
              }
              usingWebPage,
              usingFacebook,
              usingTwitter,
              usingInstagram,
              usingLinkedIn,
              usingYoutube
            }
          }
        }",
    "variables":{
      "input": {
        "proposalFormId": "proposalForm1",
        "title": "New title",
        "titleHelpText": "Title help",
        "description": "New description",
        "descriptionHelpText": "Description help",
        "summaryHelpText": "Summary Help",
        "illustrationHelpText": "Illustration Help",
        "usingThemes": true,
        "themeMandatory": true,
        "themeHelpText": "Theme Help",
        "usingDistrict": true,
        "allowAknowledge": true,
        "districtMandatory": true,
        "districtHelpText": "District Help",
        "usingCategories": true,
        "categoryMandatory": true,
        "proposalInAZoneRequired": true,
        "categoryHelpText": "Category Help",
        "usingAddress": true,
        "addressHelpText": "Address help",
        "usingDescription": true,
        "usingSummary": true,
        "usingIllustration": true,
        "descriptionMandatory": true,
        "objectType": "PROPOSAL",
        "mapCenter": "[{\"geometry\":{\"location_type\":\"GEOMETRIC_CENTER\",\"location\":{\"lat\":\"42\",\"lng\":\"0\"}}}]",
        "zoomMap": 0,
        "commentable": true,
        "costable": true,
        "categories": [
          {
            "id": "pCategory1",
            "name": "Aménagement",
            "color": "COLOR_880E4F",
            "categoryImage":	"categoryImage15"
          },
          {
            "id": "pCategory2",
            "color": "COLOR_B71C1C",
            "name": "Politique"
          },
          {
            "name": "New category",
            "color": "COLOR_1E88E5",
            "newCategoryImage":	"media5"
          },
          {
            "name": "Vide",
            "color": "COLOR_1B5E20"
          },
          {
            "name": "Image perso",
            "color": "COLOR_43A047",
            "newCategoryImage":	"media6"
          },
          {
            "name": "Ecole",
            "color": "COLOR_827717",
            "categoryImage":	"school"
          }
        ],
        "districts": [{
            "displayedOnMap": false,
            "geojson": "",
            "translations":[{"locale":"fr-FR","name":"Beauregard"}]
          },
          {
            "displayedOnMap": true,
            "geojson": "",
            "translations":[{"locale":"fr-FR","name":"autre district"}]
          }
        ],
        "questions": [],
        "usingWebPage":true,
        "usingFacebook":true,
        "usingTwitter":true,
        "usingInstagram":true,
        "usingLinkedIn":true,
        "usingYoutube": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
{
   "data":{
      "updateProposalForm":{
         "proposalForm":{
            "id":"proposalForm1",
            "title":"New title",
            "titleHelpText":"Title help",
            "allowAknowledge":true,
            "description":"New description",
            "descriptionHelpText":"Description help",
            "summaryHelpText":"Summary Help",
            "illustrationHelpText":"Illustration Help",
            "usingThemes":true,
            "themeMandatory":true,
            "themeHelpText":"Theme Help",
            "usingDistrict":true,
            "districtMandatory":true,
            "districtHelpText":"District Help",
            "usingCategories":true,
            "categoryMandatory":true,
            "categoryHelpText":"Category Help",
            "usingAddress":true,
            "addressHelpText":"Address help",
            "usingDescription":true,
            "usingSummary":true,
            "usingIllustration":true,
            "descriptionMandatory":true,
            "objectType":"PROPOSAL",
            "proposalInAZoneRequired":true,
            "mapCenter": {
              "lat": 42,
              "lng": 0
            },
            "zoomMap":0,
            "commentable":true,
            "costable":true,
            "categories":[
               {
                  "id":"pCategory1",
                  "name":"Am\u00e9nagement",
                  "color": "#880e4f",
                  "categoryImage":{
                     "id":"categoryImage15",
                     "image":{
                        "url":"https:\/\/capco.test\/media\/default\/0001\/01\/providerReference44.svg",
                        "id":"media-urbanisme",
                        "name":"Media Urbanisme"
                     }
                  }
               },
               {
                  "id": "@string@",
                  "name":"Ecole",
                  "color": "#827717",
                  "categoryImage":{
                     "id":"school",
                     "image":{
                        "url":"https:\/\/capco.test\/media\/default\/0001\/01\/providerReference41.svg",
                        "id":"media-scolarite",
                        "name":"Media Scolarit\u00e9"
                     }
                  }
               },
               {
                  "id": "@string@",
                  "name":"Image perso",
                  "color": "#43a047",
                  "categoryImage":{
                     "id": "@string@",
                     "image":{
                        "url":"https:\/\/capco.test\/media\/default\/0001\/01\/providerReference7.jpg",
                        "id":"media6",
                        "name":"Titre du m\u00e9dia id\u00e9e 2"
                     }
                  }
               },
               {
                  "id": "@string@",
                  "name":"New category",
                  "color": "#1e88e5",
                  "categoryImage":{
                     "id": "@string@",
                     "image":{
                        "url":"https:\/\/capco.test\/media\/default\/0001\/01\/providerReference6.jpg",
                        "id":"media5",
                        "name":"Titre du m\u00e9dia id\u00e9e 1"
                     }
                  }
               },
               {
                  "id":"pCategory2",
                  "name":"Politique",
                  "color": "#b71c1c",
                  "categoryImage": null
               },
               {
                  "id": "@string@",
                  "name":"Vide",
                  "color": "#1b5e20",
                  "categoryImage":null
               }
            ],
            "districts":[
               {
                  "id":"@string@",
                  "name":"Beauregard",
                  "geojson":null,
                  "displayedOnMap":false
               },
               {
                  "id":"@string@",
                  "name":"autre district",
                  "geojson":null,
                  "displayedOnMap":true
               }
            ],
            "questions": [],
            "usingWebPage":true,
            "usingFacebook":true,
            "usingTwitter":true,
            "usingInstagram":true,
            "usingLinkedIn":true,
            "usingYoutube":true
         }
      }
   }
}
  """

@database
Scenario: GraphQL client wants to update custom fields of a proposal form
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
      updateProposalForm(input: $input) {
        proposalForm {
          id
          questions {
            id
            helpText
            private
            required
            title
            type
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm1",
        "questions": [
          {
            "question": {
              "title": "Etes-vous réél ?",
              "helpText": "Peut-être que non...",
              "private": false,
              "required": true,
              "type": "text"
            }
          },
          {
            "question": {
              "title": "Documents à remplir",
              "helpText": "5 fichiers max",
              "private": false,
              "required": true,
              "type": "medias"
            }
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
      "updateProposalForm": {
        "proposalForm": {
          "id": "proposalForm1",
          "questions": [
            {
              "id": @string@,
              "helpText": "Peut-être que non...",
              "private": false,
              "required": true,
              "title": "Etes-vous réél ?",
              "type": "text"
            },
            {
              "id": @string@,
              "helpText": "5 fichiers max",
              "private": false,
              "required": true,
              "title": "Documents à remplir",
              "type": "medias"
            }
          ]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to delete the first question
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
      updateProposalForm(input: $input) {
        proposalForm {
          id
          questions {
            id
            title
            type
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm13",
        "questions": [
          {
            "question": {
              "id": "UXVlc3Rpb246NDg=",
              "title": "Question Multiple?",
              "helpText": null,
              "description": null,
              "type": "radio",
              "private": false,
              "required": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzMg==",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzMw==",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNA==",
                  "title": "Peut être",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false,
              "randomQuestionChoices": false,
              "jumps": []
            }
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
      "updateProposalForm": {
        "proposalForm": {
          "id": "proposalform13",
          "questions": [
            {
              "id": "UXVlc3Rpb246NDg=",
              "title": "Question Multiple?",
              "type": "radio"
            }
          ]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to delete the first question choice
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
      updateProposalForm(input: $input) {
        proposalForm {
          id
          questions {
            id
            title
            type
            ... on MultipleChoiceQuestion {
              choices(allowRandomize: false) {
                edges {
                  node {
                    id
                    title
                    description
                    color
                  }
                }
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm13",
        "questions": [
          {
            "question": {
              "id": "UXVlc3Rpb246MTMxNA==",
              "private": false,
              "required": false,
              "title": "Question simple?",
              "type": "text"
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246NDg=",
              "title": "Question Multiple?",
              "helpText": null,
              "description": null,
              "type": "radio",
              "private": false,
              "required": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzMw==",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNA==",
                  "title": "Peut être",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false,
              "randomQuestionChoices": false,
              "jumps": []
            }
          }
        ],
        "proposalFormId": "proposalform13"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProposalForm": {
        "proposalForm": {
          "id": "proposalform13",
          "questions": [
            {
              "id": "UXVlc3Rpb246MTMxNA==",
              "title": "Question simple?",
              "type": "text"
            },
            {
              "id": "UXVlc3Rpb246NDg=",
              "title": "Question Multiple?",
              "type": "radio",
              "choices": {
                "edges": [
                  {
                    "node": {
                      "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzMw==",
                      "title": "Non",
                      "description": null,
                      "color": null
                    }
                  },
                  {
                    "node": {
                      "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNA==",
                      "title": "Peut être",
                      "description": null,
                      "color": null
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to delete the first district
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
      updateProposalForm(input: $input) {
        proposalForm {
          id
          districts {
            id
            name (locale: FR_FR)
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm13",
        "districts": [
          {
            "id": "district15",
            "translations":[{"locale":"fr-FR","name":"Quartier 2"}],
            "displayedOnMap": true,
            "geojson": null
          },
          {
            "id": "district16",
            "translations":[{"locale":"fr-FR","name":"Quartier 3"}],
            "displayedOnMap": true,
            "geojson": null
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
      "updateProposalForm": {
        "proposalForm": {
          "id": "proposalform13",
          "districts": [
            {
              "id": "district15",
              "name": "Quartier 2"
            },
            {
              "id": "district16",
              "name": "Quartier 3"
            }
          ]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to delete the first category
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
      updateProposalForm(input: $input) {
        proposalForm {
          id
          categories {
            id
            name
            color
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm13",
        "categories": [
          {
            "id": "pCategory8",
            "name": "Escrime",
            "color": "COLOR_EF5350"
          },
          {
            "id": "pCategory7",
            "name": "Water Polo",
            "color": "COLOR_9C27B0"
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
      "updateProposalForm": {
        "proposalForm": {
          "id": "proposalform13",
          "categories": [
            {
              "id": "pCategory8",
              "name": "Escrime",
              "color": "#ef5350"
            },
            {
              "id": "pCategory7",
              "name": "Water Polo",
              "color": "#9c27b0"
            }
          ]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL admin wants to update the view configuration of the form
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
      updateProposalForm(input: $input) {
        proposalForm {
          id
          isGridViewEnabled
          isListViewEnabled
          isMapViewEnabled
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm13",
        "isGridViewEnabled": false,
        "isListViewEnabled": true
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProposalForm": {
        "proposalForm": {
          "id": "proposalform13",
          "isGridViewEnabled": false,
          "isListViewEnabled": true,
          "isMapViewEnabled": false
        }
      }
    }
  }
  """

@database
Scenario: GraphQL admin wants to disable all views and fails
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
      updateProposalForm(input: $input) {
        proposalForm {
          id
          isGridViewEnabled
          isListViewEnabled
          isMapViewEnabled
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm13",
        "isGridViewEnabled": false,
        "isListViewEnabled": false,
        "isMapViewEnabled": false
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "No view is active. At least one must be selected",
        "@*@": "@*@"
      }
    ],
    "data": {
      "updateProposalForm": null
    }
  }
  """

@database
Scenario: GraphQL admin wants to add tipsmeee
  Given feature "unstable__tipsmeee" is enabled
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
      updateProposalForm(input: $input) {
        proposalForm {
          id
          usingTipsmeee
          tipsmeeeHelpText
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm13",
        "usingTipsmeee": true,
        "tipsmeeeHelpText": "Entrez votre code tipsmeee ici"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "updateProposalForm":{
           "proposalForm":{
              "id":"proposalform13",
              "usingTipsmeee":true,
              "tipsmeeeHelpText":"Entrez votre code tipsmeee ici"
           }
        }
     }
  }
  """

@database
Scenario: GraphQL admin wants to add tipsmeee but feature is disable
  Given I disable feature "unstable__tipsmeee"
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
      updateProposalForm(input: $input) {
        proposalForm {
          id
          usingTipsmeee
          tipsmeeeHelpText
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm13",
        "usingTipsmeee": true,
        "tipsmeeeHelpText": "Entrez votre code tipsmeee ici"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "updateProposalForm":{
           "proposalForm":{
              "id":"proposalform13",
              "usingTipsmeee":false,
              "tipsmeeeHelpText":null
           }
        }
     }
  }
  """
