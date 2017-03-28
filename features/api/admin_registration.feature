@admin_registration
Feature: Admin registration

  @database
  Scenario: Admin API client wants to add a question
    Given I am logged in to api as xlacot
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
    Then the JSON response status code should be 200

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
    Scenario: Admin API client wants to update a question
      Given I am logged in to api as xlacot
      When I send a PUT request to "/api/registration_form/questions/14" with json:
      """
      {
        "type": "4",
        "question": "Nouveau nom",
        "required": false,
        "choices": [
            { "label": "Nouveau choix 1" },
            { "label": "Nouveau choix 2" }
        ]
      }
      """
      Then the JSON response status code should be 200
