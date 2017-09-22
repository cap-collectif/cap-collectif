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
          latMap
          lngMap
          zoomMap
          categories {
            id
            name
          }
          districts {
            id
            name
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": 1,
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
        "categoryHelpText": "Category Help",
        "usingAddress": true,
        "addressHelpText": "Address help",
        "latMap": 0.0,
        "lngMap": 0.0,
        "zoomMap": 0,
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
          "id": "1",
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
          "categoryHelpText": "Category Help",
          "usingAddress": true,
          "addressHelpText": "Address help",
          "latMap": 0,
          "lngMap": 0,
          "zoomMap": 0,
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
              "id": "district1",
              "name": "Beauregard"
            },
            {
              "id": @string@,
              "name": "Other district"
            }
          ]
        }
      }
    }
  }
  """
