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
        "questionnaireId": "questionnaire2",
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
              "id":"questionnaire2",
              "title":"New title",
              "description":"New description",
              "questions":[
                 {
                    "id":"4",
                    "title":"Evaluez le co\u00fbt de votre proposition",
                    "helpText":"D\u00e9crivez dans les grandes lignes le budget de votre proposition",
                    "description":null,
                    "type":"textarea",
                    "private":false,
                    "required":true,
                    "kind":"simple"
                 },
                 {
                    "id":"666",
                    "title":"ça roule ?",
                    "helpText":null,
                    "description":null,
                    "type":"textarea",
                    "private":false,
                    "required":true,
                    "kind":"simple"
                 },
                 {
                    "id":"1313",
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
        "questionnaireId": "questionnaire2",
        "questions": [
          {
            "question": {
              "description": "Youpla",
              "helpText": "text",
              "id": "666",
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
              "id": "4",
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
              "id": "666",
              "title": "Luffy ou Zoro ?",
              "helpText": "text",
              "description": "Youpla",
              "type": "text",
              "private": false,
              "required": true
            },
            {
              "id": "4",
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
