@admin_registration
Feature: Admin registration

  @database
  Scenario: Admin API client wants to add a question
    Given I am logged in to api as admin
    When I send a POST request to "/api/registration_form/questions" with json:
    """
    {
      "type": "4",
      "question": "Question 1",
      "required": false,
      "choices": [
          { "label": "Choix 1" },
          { "label": "Choix 2" }
      ]
    }
    """
    Then the JSON response status code should be 201
