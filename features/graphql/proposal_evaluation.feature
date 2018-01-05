@proposal @proposal_evaluation
Feature: Proposal Evaluation

@database
Scenario: Admin wants to update the evaluation of a proposal
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
  {
    "query": "mutation ($input: ChangeProposalEvaluationInput!) {
      changeProposalEvaluation(input: $input) {
        proposal {
          id
          evaluation {
            responses {
              question {
                id
              }
              ... on ValueResponse {
                value
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "proposal2",
        "responses": [
           {
              "question": "8",
              "value":"Modification de l'évaluation"
           },
           {
              "question": "9",
              "value":"Cette évaluation est hyper utile, à accepter."
           },
           {
              "question": "20",
              "value":"{\"labels\":\"Au top\",\"other\":null}"},
           {
              "question": "21",
              "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
           },
           {
              "question": "22",
              "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
           },
           {
              "question": "23",
              "value":"{\"labels\":[\"Réalisable\",\"Importante\"],\"other\":null}"
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
      "changeProposalEvaluation": {
        "proposal": {
          "id": "proposal2",
          "evaluation": {
            "responses": [
            {
               "question": { "id": "8" },
               "value":"Modification de l'évaluation"
            },
            {
               "question": { "id": "9" },
               "value":"Cette évaluation est hyper utile, à accepter."
            },
            {
               "question": { "id": "20" },
               "value":"{\"labels\":\"Au top\",\"other\":null}"},
            {
               "question": { "id": "21" },
               "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
            },
            {
               "question": { "id": "22" },
               "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
            },
            {
               "question": { "id": "23" },
               "value":"{\"labels\":[\"Réalisable\",\"Importante\"],\"other\":null}"
            }
            ]
          }
        }
      }
    }
  }
  """

@database
Scenario: Evaluer wants to update the evaluation of a proposal
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
  {
    "query": "mutation ($input: ChangeProposalEvaluationInput!) {
      changeProposalEvaluation(input: $input) {
        proposal {
          id
          evaluation {
            responses {
              question {
                id
              }
              ... on ValueResponse {
                value
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "proposal2",
        "responses": [
        {
           "question": "8",
           "value": "Pouet"
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
      "changeProposalEvaluation": {
        "proposal": {
          "id": "proposal2",
          "evaluation": {
            "responses": [
              {
                "question": { "id": "8" },
                "value": "Pouet"
              },
              @...@
            ]
          }
        }
      }
    }
  }
  """

@security
Scenario: Non evaluer wants to update the evaluation of a proposal
  Given I am logged in to graphql as pierre
  And I send a GraphQL POST request:
   """
  {
    "query": "mutation ($input: ChangeProposalEvaluationInput!) {
      changeProposalEvaluation(input: $input) {
        proposal {
          id
          evaluation {
            responses {
              question {
                id
              }
              ... on ValueResponse {
                value
              }
            }
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "proposal2",
        "responses": []
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"You are not an evaluer of proposal with id proposal2","locations":[{"line":1,"column":55}],"path":["changeProposalEvaluation"]}],"data":{"changeProposalEvaluation":null}}
  """
