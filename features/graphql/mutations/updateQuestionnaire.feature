@updateQuestionnaire
Feature: Update Questionnaire

@database
Scenario: GraphQL client wants to update a questionnaire
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateQuestionnaireConfigurationInput!) {
      updateQuestionnaireConfiguration(input: $input) {
        questionnaire {
          id
          title
          description
          questions {
            id
            title
            helpText
            description
            type
            private
            required
            kind
          }
        }
      }
    }",
    "variables": {
      "input": {
        "questionnaireId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMg==",
        "title": "New title",
        "description": "New description"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "updateQuestionnaireConfiguration":{
           "questionnaire":{
              "id":"UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMg==",
              "title":"New title",
              "description":"New description",
              "questions":[
                 {
                    "id":"UXVlc3Rpb246NA==",
                    "title":"Evaluez le co\u00fbt de votre proposition",
                    "helpText":"D\u00e9crivez dans les grandes lignes le budget de votre proposition",
                    "description":null,
                    "type":"textarea",
                    "private":false,
                    "required":true,
                    "kind":"simple"
                 },
                 {
                    "id":"UXVlc3Rpb246NjY2",
                    "title":"ça roule ?",
                    "helpText":null,
                    "description":null,
                    "type":"textarea",
                    "private":false,
                    "required":true,
                    "kind":"simple"
                 },
                 {
                    "id":"UXVlc3Rpb246MTMxMw==",
                    "title":"Un nombre stp",
                    "helpText":null,
                    "description":null,
                    "type":"number",
                    "private":false,
                    "required":true,
                    "kind":"simple"
                 }
              ]
           }
        }
     }
  }
  """
  
@database
Scenario: GraphQL admin wants to reorder questions
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateQuestionnaireConfigurationInput!) {
      updateQuestionnaireConfiguration(input: $input) {
        questionnaire {
          questions {
            id
            title
            helpText
            description
            type
            private
            required
          }
        }
      }
    }",
    "variables": {
      "input": {
        "questionnaireId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMg==",
        "questions": [
          {
            "question": {
              "description": "Youpla",
              "helpText": "text",
              "id": "UXVlc3Rpb246NjY2",
              "private": false,
              "required": true,
              "title": "Luffy ou Zoro ?",
              "type": "text"
            }
          },
          {
            "question": {
              "description": "Ceci est un test",
              "helpText": "text",
              "id": "UXVlc3Rpb246NA==",
              "private": false,
              "required": true,
              "title": "Hé salut les amis ! C'est david lafarge pokemon comment allez-vous ?",
              "type":	"text"
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
      "updateQuestionnaireConfiguration": {
        "questionnaire": {
          "questions": [
            {
              "id": "UXVlc3Rpb246NjY2",
              "title": "Luffy ou Zoro ?",
              "helpText": "text",
              "description": "Youpla",
              "type": "text",
              "private": false,
              "required": true
            },
            {
              "id": "UXVlc3Rpb246NA==",
              "title": "Hé salut les amis ! C'est david lafarge pokemon comment allez-vous ?",
              "helpText": "text",
              "description": "Ceci est un test",
              "type": "text",
              "private": false,
              "required": true
            }
          ]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL admin wants to delete first question
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateQuestionnaireConfigurationInput!) {
      updateQuestionnaireConfiguration(input: $input) {
        questionnaire {
          questions {
            id
            title
            type
          }
        }
      }
    }",
    "variables": {
      "input": {
        "questionnaireId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMTA=",
        "title": "Questionnaire non rattaché",
        "description": "<p>Excepturi esse similique laudantium quis. Minus sint fugit voluptatem voluptas.</p>",
        "questions": [
          {
            "question": {
              "id": "UXVlc3Rpb246NDk=",
              "private": false,
              "otherAllowed": false,
              "randomQuestionChoices": false,
              "choices": [
                {
                  "color": null,
                  "description": null,
                  "id": "questionchoice35",
                  "image": null,
                  "title": "premier choix"
                },
                {
                  "color": null,
                  "description": null,
                  "id": "questionchoice36",
                  "image": null,
                  "title": "deuxième choix"
                },
                {
                  "color": null,
                  "description": null,
                  "id": "questionchoice37",
                  "image": null,
                  "title": "troisième choix"
                }
              ],
              "required": false,
              "title": "J'ai plusieurs choix?",
              "type": "radio"
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
      "updateQuestionnaireConfiguration": {
        "questionnaire": {
          "questions": [
            {
              "id": "UXVlc3Rpb246NDk=",
              "title": "J'ai plusieurs choix?",
              "type": "radio"
            }
          ]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL admin wants to delete first question choice
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateQuestionnaireConfigurationInput!) {
      updateQuestionnaireConfiguration(input: $input) {
        questionnaire {
          questions {
            id
            title
            type
            ... on MultipleChoiceQuestion {
              choices(allowRandomize: false) {
                id
                title
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "questionnaireId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMTA=",
        "title": "Questionnaire non rattaché",
        "description": "<p>Excepturi esse similique laudantium quis. Minus sint fugit voluptatem voluptas.</p>",
        "questions": [
          {
            "question": {
              "id": "UXVlc3Rpb246MTMxNQ==",
              "private": false,
              "required": false,
              "title": "Je n'ai pas de projet?",
              "type": "text"
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246NDk=",
              "private": false,
              "otherAllowed": false,
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "color": null,
                  "description": null,
                  "id": "questionchoice36",
                  "image": null,
                  "title": "deuxième choix"
                },
                {
                  "color": null,
                  "description": null,
                  "id": "questionchoice37",
                  "image": null,
                  "title": "troisième choix"
                }
              ],
              "required": false,
              "title": "J'ai plusieurs choix?",
              "jumps": [],
              "type": "radio"
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
      "updateQuestionnaireConfiguration": {
        "questionnaire": {
          "questions": [
            {
              "id": "UXVlc3Rpb246MTMxNQ==",
              "title": "Je n'ai pas de projet?",
              "type": "text"
            },
            {
              "id": "UXVlc3Rpb246NDk=",
              "title": "J'ai plusieurs choix?",
              "type": "radio",
              "choices": [
                {
                  "id": "questionchoice36",
                  "title": "deuxième choix"
                },
                {
                  "id": "questionchoice37",
                  "title": "troisième choix"
                }
              ]
            }
          ]
        }
      }
    }
  }
  """
