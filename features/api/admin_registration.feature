@admin_registration
Feature: Admin registration

@database
Scenario: Admin API client wants to delete a question
  Given I am logged in to api as admin
  When I send a DELETE request to "/api/registration_form/questions/14"
  Then the JSON response status code should be 204

@database
Scenario: Admin API client wants to update top and bottom texts
  Given I am logged in to api as admin
  When I send a PUT request to "/api/registration_form" with json:
  """
  {
      "bottomText": "bottom",
      "bottomTextDisplayed": true,
      "topTextDisplayed": true,
      "topText": "top"
  }
  """
  Then the JSON response status code should be 204

@database
Scenario: Admin API client wants to update emails domains
  Given I am logged in to api as admin
  When I send a PUT request to "/api/registration_form" with json:
  """
  {
      "domains": [
        { "value": "gouv.fr" },
        { "value": "jolicode.com" }
      ]
  }
  """
  Then the JSON response status code should be 204
