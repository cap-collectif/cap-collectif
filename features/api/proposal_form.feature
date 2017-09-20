@proposal_forms
Feature: ProposalForm Restful Api
  As an API client

<<<<<<< HEAD
@parallel-scenario
Scenario: Anonymous API client wants to get one proposal form
  When I send a GET request to "/api/proposal_forms/1"
  Then the JSON response should match:
"""
{
  "id": @integer@,
  "title": @string@,
  "titleHelpText": @string@,
  "description": @string@,
  "descriptionHelpText": @string@,
  "themeHelpText": @string@,
  "districtHelpText": @string@,
  "categoryHelpText": @string@,
  "isContribuable": true,
  "usingThemes": @boolean@,
  "themeMandatory": @boolean@,
  "usingDistrict": @boolean@,
  "districtMandatory": @boolean@,
  "usingCategories": @boolean@,
  "categoryMandatory": @boolean@,
  "usingAddress": @boolean@,
  "addressHelpText": null,
  "zoomMap": @integer@,
  "latMap": @number@,
  "lngMap": @number@,
  "districts": [
    {
      "name": @string@,
      "id": @string@
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
=======
  @parallel-scenario
  Scenario: Anonymous API client wants to get one proposal form
    When I send a GET request to "/api/proposal_forms/1"
    Then the JSON response should match:
    """
>>>>>>> wip
    {
      "id": @integer@,
      "title": @string@,
      "titleHelpText": @string@,
      "description": @string@,
      "descriptionHelpText": @string@,
      "themeHelpText": @string@,
      "districtHelpText": @string@,
      "categoryHelpText": @string@,
      "isContribuable": true,
      "usingThemes": @boolean@,
      "themeMandatory": @boolean@,
      "usingDistrict": @boolean@,
      "districtMandatory": @boolean@,
      "usingCategories": @boolean@,
      "categoryMandatory": @boolean@,
      "usingAddress": @boolean@,
      "addressHelpText": null,
      "zoomMap": @integer@,
      "latMap": @number@,
      "lngMap": @number@,
      "categories":[
        {
          "name": "Aménagement",
          "id": @integer@
        },
        {
          "name": "Politique",
          "id": @integer@
        }
      ],
      "districts": [
        {
          "name": @string@,
          "id": @string@
        },
        @...@
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

    @database
    Scenario: Admin API Client want to add a Proposal Form with only required field
      Given I am logged in to api as admin
      When I send a POST request to "/api/proposal_forms" with json:
      """
      {
        "title": "Mon petit formulaire de proposition"
      }
      """
      Then the JSON response status code should be 201


