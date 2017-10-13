@proposal
Feature: Proposal Evaluation

@database
Scenario: GraphQL client wants to update a proposal Evaluation
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
  {
    "query": "mutation ($input: ChangeProposalEvaluationInput!) {
      changeProposalEvaluation(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "proposalId": "proposal2",
        "responses": [
           {
              "question":"8",
              "value":"Modification de l'évaluation"
           },
           {
              "question":"9",
              "value":"Cette évaluation est hyper utile, à accepter."
           },
           {
              "question":"20",
              "value":"{\"labels\":\"Au top\",\"other\":null}"},
           {
              "question":"21",
              "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
           },
           {
              "question":"22",
              "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
           },
           {
              "question":"23",
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
          "id": "proposal2"
        }
      }
    }
  }
  """
