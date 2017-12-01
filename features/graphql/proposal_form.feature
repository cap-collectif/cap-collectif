@proposal_form
Feature: Proposal Forms

@database
Scenario: GraphQL client wants to create a proposal form
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalFormInput!) {
      createProposalForm(input: $input) {
        proposalForm {
          id
          title
        }
      }
    }",
    "variables": {
      "input": {
        "title": "Cliquer"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createProposalForm": {
        "proposalForm": {
          "id": @string@,
          "title": "Cliquer"
        }
      }
    }
  }
  """

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
          categories {
            id
            name
          }
          districts {
            id
            name
          }
          questions {
            id
            position
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
        "categories": [
          {
            "name": "Aménagement"
          },
          {
            "name": "Politique"
          },
          {
            "name": "New category"
          }
        ],
        "districts": [
          {
            "name": "Beauregard",
            "displayedOnMap": false,
            "geojson": ""
          },
          {
            "name": "Other district",
            "displayedOnMap": true,
            "geojson": ""
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
          "proposalInAZoneRequired": true,
          "categoryHelpText": "Category Help",
          "usingAddress": true,
          "addressHelpText": "Address help",
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
          "districts": @wildcard@,
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
            position
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
            "position": 1,
            "question": {
              "title": "Etes-vous réél ?",
              "helpText": "Peut-être que non...",
              "private": false,
              "required": true,
              "type": "text"
            }
          },
          {
            "position": 2,
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
              "position": 1,
              "title": "Etes-vous réél ?",
              "helpText": "Peut-être que non...",
              "private": false,
              "required": true,
              "type": "text"
            },
            {
              "id": @string@,
              "position": 2,
              "title": "Documents à remplir",
              "helpText": "5 fichiers max",
              "private": false,
              "required": true,
              "type": "medias"
            }
          ]
        }
      }
    }
  }
  """
