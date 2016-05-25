@questionnaire
Feature: Questionnaire Restful Api
  As an API client

  @parallel-scenario
  Scenario: Anonymous API client wants to get one questionnaire
    When I send a GET request to "/api/questionnaires/1"
    Then the JSON response should match:
    """
    {
      "id": @integer@,
      "title": @string@,
      "description": @string@,
      "contribuable": @boolean@,
      "multipleRepliesAllowed" : @boolean@,
      "anonymousAllowed": @boolean@,
      "phoneConfirmationRequired": @boolean@,
      "fields": [
        {
          "id": @integer@,
          "type": @string@,
          "helpText": @...@,
          "required": @boolean@,
          "question": @string@,
          "slug": @string@
        },
        {
          "id": @integer@,
          "type": @string@,
          "helpText": @...@,
          "required": @boolean@,
          "question": @string@,
          "slug": @string@,
          "randomChoices": @boolean@,
          "isOtherAllowed": @boolean@,
          "choices": [
            {
              "id": @integer@,
              "label": @string@,
              "description": @string@,
              "position": @integer@
            },
            @...@
          ]
        },
        {
          "id": @integer@,
          "type": @string@,
          "helpText": @...@,
          "required": @boolean@,
          "question": @string@,
          "slug": @string@,
          "randomChoices": @boolean@,
          "isOtherAllowed": @boolean@,
          "choices": [
            {
              "id": @integer@,
              "label": @string@,
              "description": @string@,
              "position": @integer@
            },
            @...@
          ]
        },
        {
          "id": @integer@,
          "type": @string@,
          "helpText": @...@,
          "required": @boolean@,
          "question": @string@,
          "slug": @string@,
          "randomChoices": @boolean@,
          "isOtherAllowed": @boolean@,
          "choices": [
            {
              "id": @integer@,
              "label": @string@,
              "description": @string@,
              "position": @integer@
            },
            @...@
          ]
        },
        @...@
      ]
    }
    """
