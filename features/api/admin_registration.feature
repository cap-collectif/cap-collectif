@admin_registration
Feature: Admin registration

@database
Scenario: Admin API client wants to delete a question
  Given I am logged in to api as admin
  When I send a DELETE request to "/api/registration_form/questions/14"
  Then the JSON response status code should be 204
