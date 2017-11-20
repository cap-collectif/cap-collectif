@proposal_forms
Feature: ProposalForm Restful Api
  As an API client

@parallel-scenario
Scenario: Anonymous API client wants to get one proposal form
  When I send a GET request to "/api/proposal_forms/proposalForm1"
  Then the JSON response should match:
  """
  {
  "id": @string@,
  "title": @string@,
  "titleHelpText": @string@,
  "description": @string@,
  "descriptionHelpText": @string@,
  "themeHelpText": @string@,
  "districtHelpText": @string@,
  "categoryHelpText": @string@,
  "isContribuable": true,
  "commentable": @boolean@,
  "proposalInAZoneRequired": @boolean@,
  "usingThemes": @boolean@,
  "themeMandatory": @boolean@,
  "usingDistrict": @boolean@,
  "districtMandatory": @boolean@,
  "usingCategories": @boolean@,
  "categoryMandatory": @boolean@,
  "usingAddress": @boolean@,
  "addressHelpText": @null@,
  "summaryHelpText": @null@,
  "zoomMap": @integer@,
  "latMap": @number@,
  "lngMap": @number@,
  "districts": [
    {
      "name": @string@,
      "id": @string@,
      "geojson": @wildcard@,
      "displayedOnMap": @boolean@
    },
     @...@
  ],
  "categories":[
    {
      "name": "Aménagement",
      "id": "pCategory1"
    },
    {
      "name": "Politique",
      "id": "pCategory2"
    }
  ],
  "fields": [
      {
          "id": @integer@,
          "type": @string@,
          "helpText": @string@,
          "required": @boolean@,
          "private": @boolean@,
          "question": @string@,
          "slug": @string@
        },
        {
          "id": @integer@,
          "type": @string@,
          "helpText": @string@,
          "required": true,
          "private": @boolean@,
          "question": @string@,
          "slug": @string@
        },
        {
          "id": @integer@,
          "type": @string@,
          "helpText": @string@,
          "required": false,
          "private": @boolean@,
          "question": @string@,
          "slug": @string@
        },
        {
          "id": @integer@,
          "type": @string@,
          "helpText": @string@,
          "required": false,
          "private": @boolean@,
          "question": @string@,
          "slug": @string@
        }
  ]
  }
  """
