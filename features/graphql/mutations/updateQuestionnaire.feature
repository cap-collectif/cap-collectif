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
        "description": "<p>New description</p>"
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
              "description":"\u003Cp\u003ENew description\u003C\/p\u003E",
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
              "description": "<p><strong>Youpla</strong></p>",
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
              "description": "<p><strong>Youpla</strong></p>",
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
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNQ==",
                  "image": null,
                  "title": "premier choix"
                },
                {
                  "color": null,
                  "description": null,
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNg==",
                  "image": null,
                  "title": "deuxième choix"
                },
                {
                  "color": null,
                  "description": null,
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNw==",
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
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNg==",
                  "image": null,
                  "title": "deuxième choix"
                },
                {
                  "color": null,
                  "description": null,
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNw==",
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
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNg==",
                  "title": "deuxième choix"
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNw==",
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

@database
Scenario: GraphQL admin wants to delete a logic jump of a question in a questionnaire with jumps
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateQuestionnaireConfigurationInput!) {
      updateQuestionnaireConfiguration(input: $input) {
        questionnaire {
          questions {
            id
            __typename
            jumps {
              id
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "questionnaireId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlV2l0aEp1bXBz",
        "title": "El famoso questionnaire a branche",
        "description": "<p>Est expedita eum eos cupiditate. Adipisci dignissimos est pariatur nulla voluptatem.</p>",
        "questions": [
          {
            "question": {
              "id": "UXVlc3Rpb246MjQ=",
              "title": "Hap ou Noel ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": null,
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXA=",
                  "title": "Hap",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2Vs",
                  "title": "Noel",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246NDU=",
              "title": "Votre fleuve préféré",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [
                {
                  "id": "logicjump2",
                  "conditions": [
                    {
                      "id": "ljconditionFleuveHap",
                      "operator": "IS",
                      "question": "UXVlc3Rpb246MjQ=",
                      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXA="
                    }
                  ],
                  "origin": "UXVlc3Rpb246NDU=",
                  "destination": "UXVlc3Rpb246MjU="
                },
                {
                  "id": "logicjump3",
                  "conditions": [
                    {
                      "id": "ljconditionNoel",
                      "operator": "IS",
                      "question": "UXVlc3Rpb246MjQ=",
                      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2Vs"
                    }
                  ],
                  "origin": "UXVlc3Rpb246NDU=",
                  "destination": "UXVlc3Rpb246Mjc="
                }
              ],
              "alwaysJumpDestinationQuestion": null,
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY0xlR2FuZ2U=",
                  "title": "Le gange",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VMZU5pbA==",
                  "title": "Le nil",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VMYVNlaW5l",
                  "title": "La seine",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VBbWF6b25l",
                  "title": "L'Amazone",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246NDY=",
              "title": "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MjU=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBHYW5nZU91aQ==",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBHYW5nZU5vbg==",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MjU=",
              "title": "Par qui Hap a t-il été créé ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MjY=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VKdmM=",
                  "title": "JVC",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VUZXNsYQ==",
                  "title": "Tesla",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VDaXNsYQ==",
                  "title": "Cisla",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MjY=",
              "title": "Hap est-il un homme bon ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [
                {
                  "id": "logicjump10",
                  "conditions": [
                    {
                      "id": "ljconditionHapGood",
                      "operator": "IS",
                      "question": "UXVlc3Rpb246MjY=",
                      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBCb25Ob24="
                    }
                  ],
                  "origin": "UXVlc3Rpb246MjY=",
                  "destination": "UXVlc3Rpb246Mzk="
                }
              ],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzE=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBCb25PdWk=",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBCb25Ob24=",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246Mzk=",
              "title": "Comment ça ce n'est pas un homme bon, comment oses-tu ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzE=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBOb3RHb29kSG93RGFyZVlvdU9r",
                  "title": "Oki",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBOb3RHb29kSG93RGFyZVlvdUdw",
                  "title": "mdr g pas lu",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246Mjc=",
              "title": "Noel a t-il un rapport avec la fête de Noël ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246Mjg=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2VsT3Vp",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2VsTm9uQmFrYQ==",
                  "title": "Non baka",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246Mjg=",
              "title": "De quelle couleur est le chapeau de Noël ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzE=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2VsUmVkSGF0",
                  "title": "Rouge",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2VsR3JlZW5IYXQ=",
                  "title": "Vert",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2VsQmx1ZUhhdA==",
                  "title": "Bleu",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzE=",
              "title": "Plutôt Marvel ou DC ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [
                {
                  "id": "logicjump4",
                  "conditions": [
                    {
                      "id": "ljconditionMarvel",
                      "operator": "IS",
                      "question": "UXVlc3Rpb246MzE=",
                      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxPckRjTWFydmVs"
                    }
                  ],
                  "origin": "UXVlc3Rpb246MzE=",
                  "destination": "UXVlc3Rpb246MzU="
                },
                {
                  "id": "logicjump5",
                  "conditions": [
                    {
                      "id": "ljconditionDc",
                      "operator": "IS",
                      "question": "UXVlc3Rpb246MzE=",
                      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxPckRjRGM="
                    }
                  ],
                  "origin": "UXVlc3Rpb246MzE=",
                  "destination": "UXVlc3Rpb246MzI="
                }
              ],
              "alwaysJumpDestinationQuestion": null,
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxPckRjTWFydmVs",
                  "title": "Marvel",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxPckRjRGM=",
                  "title": "DC",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzI=",
              "title": "T'aimes bien Superman ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzM=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY1N1cGVybWFuWWVz",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY1N1cGVybWFuTm8=",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzM=",
              "title": "T'aimes bien Batman ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzQ=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY0JhdG1hblllcw==",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY0JhdG1hblllczI=",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzQ=",
              "title": "T'aimes bien Supergirl ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246Mzg=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY1N1cGVyZ2lybFllcw==",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY1N1cGVyZ2lybE5v",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzU=",
              "title": "T'aimes bien Iron Man ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzY=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxJcm9uTWFuWWVz",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxJcm9uTWFuTm8=",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzY=",
              "title": "T'aimes bien Luke Cage ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246Mzc=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxMdWtlQ2FnZVllcw==",
                  "title": "Oui c un bo chauve ténébreux",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxMdWtlQ2FnZVllczI=",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxMdWtlQ2FnZVllczM=",
                  "title": "OUI",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246Mzc=",
              "title": "T'aimes bien Thor ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246Mzg=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxUaG9yWWVz",
                  "title": "ui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxUaG9yTm8=",
                  "title": "nn",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246Mzg=",
              "title": "C'est la fin mais j'affiche quand même des choix",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": null,
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VFbmRDb25kaXRpb25Paw==",
                  "title": "Oki",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VFbmRDb25kaXRpb25PazI=",
                  "title": "Doki",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
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
              "id": "UXVlc3Rpb246MjQ=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246NDU=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": [
                {
                  "id": "logicjump2"
                },
                {
                  "id": "logicjump3"
                }
              ]
            },
            {
              "id": "UXVlc3Rpb246NDY=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MjU=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MjY=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": [
                {
                  "id": "logicjump10"
                }
              ]
            },
            {
              "id": "UXVlc3Rpb246Mzk=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246Mjc=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246Mjg=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MzE=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": [
                {
                  "id": "logicjump4"
                },
                {
                  "id": "logicjump5"
                }
              ]
            },
            {
              "id": "UXVlc3Rpb246MzI=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MzM=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MzQ=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MzU=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MzY=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246Mzc=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246Mzg=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            }
          ]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL admin wants to delete a condition in a logic jump of a question in a questionnaire with jumps
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateQuestionnaireConfigurationInput!) {
      updateQuestionnaireConfiguration(input: $input) {
        questionnaire {
          questions {
            id
            __typename
            jumps {
              id
              conditions {
                id
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "questionnaireId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlV2l0aEp1bXBz",
        "title": "El famoso questionnaire a branche",
        "description": "<p>Est expedita eum eos cupiditate. Adipisci dignissimos est pariatur nulla voluptatem.</p>",
        "questions": [
          {
            "question": {
              "id": "UXVlc3Rpb246MjQ=",
              "title": "Hap ou Noel ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": null,
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXA=",
                  "title": "Hap",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2Vs",
                  "title": "Noel",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246NDU=",
              "title": "Votre fleuve préféré",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [
                {
                  "id": "logicjump1",
                  "conditions": [
                    {
                      "id": "ljconditionFleuveGange",
                      "operator": "IS",
                      "question": "UXVlc3Rpb246NDU=",
                      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY0xlR2FuZ2U="
                    }
                  ],
                  "origin": "UXVlc3Rpb246NDU=",
                  "destination": "UXVlc3Rpb246NDY="
                },
                {
                  "id": "logicjump2",
                  "conditions": [
                    {
                      "id": "ljconditionFleuveHap",
                      "operator": "IS",
                      "question": "UXVlc3Rpb246MjQ=",
                      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXA="
                    }
                  ],
                  "origin": "UXVlc3Rpb246NDU=",
                  "destination": "UXVlc3Rpb246MjU="
                },
                {
                  "id": "logicjump3",
                  "conditions": [
                    {
                      "id": "ljconditionNoel",
                      "operator": "IS",
                      "question": "UXVlc3Rpb246MjQ=",
                      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2Vs"
                    }
                  ],
                  "origin": "UXVlc3Rpb246NDU=",
                  "destination": "UXVlc3Rpb246Mjc="
                }
              ],
              "alwaysJumpDestinationQuestion": null,
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY0xlR2FuZ2U=",
                  "title": "Le gange",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VMZU5pbA==",
                  "title": "Le nil",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VMYVNlaW5l",
                  "title": "La seine",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VBbWF6b25l",
                  "title": "L'Amazone",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246NDY=",
              "title": "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MjU=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBHYW5nZU91aQ==",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBHYW5nZU5vbg==",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MjU=",
              "title": "Par qui Hap a t-il été créé ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MjY=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VKdmM=",
                  "title": "JVC",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VUZXNsYQ==",
                  "title": "Tesla",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VDaXNsYQ==",
                  "title": "Cisla",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MjY=",
              "title": "Hap est-il un homme bon ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [
                {
                  "id": "logicjump10",
                  "conditions": [
                    {
                      "id": "ljconditionHapGood",
                      "operator": "IS",
                      "question": "UXVlc3Rpb246MjY=",
                      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBCb25Ob24="
                    }
                  ],
                  "origin": "UXVlc3Rpb246MjY=",
                  "destination": "UXVlc3Rpb246Mzk="
                }
              ],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzE=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBCb25PdWk=",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBCb25Ob24=",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246Mzk=",
              "title": "Comment ça ce n'est pas un homme bon, comment oses-tu ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzE=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBOb3RHb29kSG93RGFyZVlvdU9r",
                  "title": "Oki",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VIYXBOb3RHb29kSG93RGFyZVlvdUdw",
                  "title": "mdr g pas lu",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246Mjc=",
              "title": "Noel a t-il un rapport avec la fête de Noël ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246Mjg=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2VsT3Vp",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2VsTm9uQmFrYQ==",
                  "title": "Non baka",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246Mjg=",
              "title": "De quelle couleur est le chapeau de Noël ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzE=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2VsUmVkSGF0",
                  "title": "Rouge",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2VsR3JlZW5IYXQ=",
                  "title": "Vert",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VOb2VsQmx1ZUhhdA==",
                  "title": "Bleu",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzE=",
              "title": "Plutôt Marvel ou DC ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [
                {
                  "id": "logicjump4",
                  "conditions": [
                    {
                      "id": "ljconditionMarvel",
                      "operator": "IS",
                      "question": "UXVlc3Rpb246MzE=",
                      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxPckRjTWFydmVs"
                    }
                  ],
                  "origin": "UXVlc3Rpb246MzE=",
                  "destination": "UXVlc3Rpb246MzU="
                },
                {
                  "id": "logicjump5",
                  "conditions": [
                    {
                      "id": "ljconditionDc",
                      "operator": "IS",
                      "question": "UXVlc3Rpb246MzE=",
                      "value": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxPckRjRGM="
                    }
                  ],
                  "origin": "UXVlc3Rpb246MzE=",
                  "destination": "UXVlc3Rpb246MzI="
                }
              ],
              "alwaysJumpDestinationQuestion": null,
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxPckRjTWFydmVs",
                  "title": "Marvel",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxPckRjRGM=",
                  "title": "DC",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzI=",
              "title": "T'aimes bien Superman ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzM=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY1N1cGVybWFuWWVz",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY1N1cGVybWFuTm8=",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzM=",
              "title": "T'aimes bien Batman ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzQ=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY0JhdG1hblllcw==",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "questionchoiceUXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY0JhdG1hblllczI=DcBatmanYes2",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzQ=",
              "title": "T'aimes bien Supergirl ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246Mzg=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY1N1cGVyZ2lybFllcw==",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VEY1N1cGVyZ2lybE5v",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzU=",
              "title": "T'aimes bien Iron Man ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246MzY=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxJcm9uTWFuWWVz",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxJcm9uTWFuTm8=",
                  "title": "Non",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246MzY=",
              "title": "T'aimes bien Luke Cage ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246Mzc=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxMdWtlQ2FnZVllcw==",
                  "title": "Oui c un bo chauve ténébreux",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxMdWtlQ2FnZVllczI=",
                  "title": "Oui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxMdWtlQ2FnZVllczM=",
                  "title": "OUI",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246Mzc=",
              "title": "T'aimes bien Thor ?",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": "UXVlc3Rpb246Mzg=",
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxUaG9yWWVz",
                  "title": "ui",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VNYXJ2ZWxUaG9yTm8=",
                  "title": "nn",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
            }
          },
          {
            "question": {
              "id": "UXVlc3Rpb246Mzg=",
              "title": "C'est la fin mais j'affiche quand même des choix",
              "private": false,
              "required": false,
              "helpText": null,
              "jumps": [],
              "alwaysJumpDestinationQuestion": null,
              "description": null,
              "type": "select",
              "randomQuestionChoices": false,
              "validationRule": null,
              "choices": [
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VFbmRDb25kaXRpb25Paw==",
                  "title": "Oki",
                  "description": null,
                  "color": null,
                  "image": null
                },
                {
                  "id": "UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2VFbmRDb25kaXRpb25PazI=",
                  "title": "Doki",
                  "description": null,
                  "color": null,
                  "image": null
                }
              ],
              "otherAllowed": false
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
              "id": "UXVlc3Rpb246MjQ=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246NDU=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": [
                {
                  "id": "logicjump1",
                  "conditions": [
                    {
                      "id": "ljconditionFleuveGange"
                    }
                  ]
                },
                {
                  "id": "logicjump2",
                  "conditions": [
                    {
                      "id": "ljconditionFleuveHap"
                    }
                  ]
                },
                {
                  "id": "logicjump3",
                  "conditions": [
                    {
                      "id": "ljconditionNoel"
                    }
                  ]
                }
              ]
            },
            {
              "id": "UXVlc3Rpb246NDY=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MjU=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MjY=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": [
                {
                  "id": "logicjump10",
                  "conditions": [
                    {
                      "id": "ljconditionHapGood"
                    }
                  ]
                }
              ]
            },
            {
              "id": "UXVlc3Rpb246Mzk=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246Mjc=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246Mjg=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MzE=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": [
                {
                  "id": "logicjump4",
                  "conditions": [
                    {
                      "id": "ljconditionMarvel"
                    }
                  ]
                },
                {
                  "id": "logicjump5",
                  "conditions": [
                    {
                      "id": "ljconditionDc"
                    }
                  ]
                }
              ]
            },
            {
              "id": "UXVlc3Rpb246MzI=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MzM=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MzQ=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MzU=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246MzY=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246Mzc=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            },
            {
              "id": "UXVlc3Rpb246Mzg=",
              "__typename": "MultipleChoiceQuestion",
              "jumps": []
            }
          ]
        }
      }
    }
  }
  """
