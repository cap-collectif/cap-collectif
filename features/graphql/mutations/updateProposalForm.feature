@updateProposalForm
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
              proposalInAZoneRequired
              latMap
              lngMap
              zoomMap
              commentable
              costable
              categories(order: ALPHABETICAL) {
                id
                name
              }
              districts {
                id
                name
                geojson
                geojsonStyle
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
        "latMap": 0.0,
        "lngMap": 0.0,
        "zoomMap": 0,
        "commentable": true,
        "costable": true,
        "categories": [{
            "id": "pCategory1",
            "name": "Aménagement"
          },
          {
            "id": "pCategory2",
            "name": "Politique"
          },
          {
            "name": "New category"
          }
        ],
        "districts": [{
            "name": "Beauregard",
            "displayedOnMap": false,
            "geojson": "",
            "geojsonStyle": ""
          },
          {
            "name": "Other district",
            "displayedOnMap": true,
            "geojson": "",
            "geojsonStyle": ""
          }
        ],
        "questions": []
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
          "title": "New title",
          "titleHelpText": "Title help",
          "allowAknowledge": true,
          "description": "New description",
          "descriptionHelpText": "Description help",
          "summaryHelpText": "Summary Help",
          "illustrationHelpText": "Illustration Help",
          "usingThemes": true,
          "themeMandatory": true,
          "themeHelpText": "Theme Help",
          "usingDistrict": true,
          "districtMandatory": true,
          "districtHelpText": "District Help",
          "usingCategories": true,
          "categoryMandatory": true,
          "categoryHelpText": "Category Help",
          "usingAddress": true,
          "addressHelpText": "Address help",
          "proposalInAZoneRequired": true,
          "latMap": 0,
          "lngMap": 0,
          "zoomMap": 0,
          "commentable": true,
          "costable": true,
          "categories": [
            {
              "id": "pCategory1",
              "name": "Aménagement"
            },
            {
              "id": @string@,
              "name": "New category"
            },
            {
              "id": "pCategory2",
              "name": "Politique"
            }
          ],
          "districts": [
            {
              "id": @string@,
              "name": "Beauregard",
              "geojson": null,
              "geojsonStyle": null,
              "displayedOnMap": false
            },
            {
              "id": @string@,
              "name": "Other district",
              "geojson": null,
              "geojsonStyle": null,
              "displayedOnMap": true
            }
          ],
          "questions": []
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
              "id": "716",
              "title": "Etes-vous réél ?",
              "helpText": "Peut-être que non...",
              "private": false,
              "required": true,
              "type": "text"
            }
          },
          {
            "question": {
              "id": "717",
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
              "id": "716",
              "helpText": "Peut-être que non...",
              "private": false,
              "required": true,
              "title": "Etes-vous réél ?",
              "type": "text"
            },
            {
              "id": "717",
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
              "id": "1",
              "helpText": "Décrivez l'importance de votre proposition avec un adjectif (ex: indispensable, souhaitable ...)",
              "private": true,
              "required": false,
              "title": "Evaluez l'importance de votre proposition",
              "type": "text"
            }
          },
          {
            "question": {
              "id": "3",
              "helpText": "Décrivez dans les grandes lignes le budget de votre proposition",
              "private": false,
              "required": true,
              "title": "Evaluez le coût de votre proposition",
              "type": "textarea"
            }
          },
          {
            "question": {
              "id": "11",
              "helpText": "5 fichiers max",
              "private": false,
              "required": true,
              "title": "Documents",
              "type": "medias"
            }
          },
          {
            "question": {
              "id": "12",
              "helpText": "5 fichiers max",
              "private": false,
              "required": false,
              "title": "Bilans",
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
              "id": "1",
              "helpText": "Décrivez l'importance de votre proposition avec un adjectif (ex: indispensable, souhaitable ...)",
              "private": true,
              "required": false,
              "title": "Evaluez l'importance de votre proposition",
              "type": "text"
            },
            {
              "id": "3",
              "helpText": "Décrivez dans les grandes lignes le budget de votre proposition",
              "private": false,
              "required": true,
              "title": "Evaluez le coût de votre proposition",
              "type": "textarea"
            },
            {
              "id": "11",
              "helpText": "5 fichiers max",
              "private": false,
              "required": true,
              "title": "Documents",
              "type": "medias"
            },
            {
              "id": "12",
              "helpText": "5 fichiers max",
              "private": false,
              "required": false,
              "title": "Bilans",
              "type": "medias"
            }
          ]
        }
      }
    }
  }
  """
