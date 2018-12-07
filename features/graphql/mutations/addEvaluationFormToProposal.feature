@addEvaluationFromToProposal
Feature: Add an evaluation form to a proposal

@database
Scenario: Admin wants to add an evaluation form to a proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation SetEvaluationFormInProposalFormMutation($input: SetEvaluationFormInProposalFormInput!) {
      setEvaluationFormInProposalForm(input: $input) {
        proposalForm {
           id
           evaluationForm {
              id
              title
           }
        }
      }
    }",
    "variables": {
      "input": {
        "evaluationFormId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlNQ==",
        "proposalFormId": "proposalFormVote"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "setEvaluationFormInProposalForm":{
           "proposalForm":{
              "id":"proposalFormVote",
              "evaluationForm":{
                 "id":"questionnaire5",
                 "title":"Questionnaire pour budget participatif disponible"
              }
           }
        }
     }
  }
  """
