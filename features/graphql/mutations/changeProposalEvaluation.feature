@changeProposalEvaluation
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
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "version": 1,
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
          "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
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
            },
            {
              "question": {"id":"47"},
              "value": null
            }
            ]
          }
        }
      }
    }
  }
  """

@database
Scenario: Admin wants to update the evaluation of a proposal and the version should be increased
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
  {
    "query": "mutation ($input: ChangeProposalEvaluationInput!) {
      changeProposalEvaluation(input: $input) {
        proposal {
          id
          evaluation {
            version
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
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "version": 1,
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
          "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
          "evaluation": {
            "version": 2,
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
            },
            {
              "question": {"id":"47"},
              "value": null
            }
            ]
          }
        }
      }
    }
  }
  """

@database
Scenario: Admin should be prompted to refresh page if someone has already modified an evaluation since
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
 """
{
  "query": "mutation ($input: ChangeProposalEvaluationInput!) {
    changeProposalEvaluation(input: $input) {
      proposal {
        id
        evaluation {
          version
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
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwy",
      "version": 1,
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
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "evaluation": {
          "version": 2,
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
          },
          {
              "question": {"id":"47"},
              "value": null
           }
          ]
        }
      }
    }
  }
}
"""
  And I send a GraphQL POST request:
 """
{
  "query": "mutation ($input: ChangeProposalEvaluationInput!) {
    changeProposalEvaluation(input: $input) {
      proposal {
        id
        evaluation {
          version
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
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwy",
      "version": 1,
      "responses": [
         {
            "question": "8",
            "value":"Encore une modification de l'évaluation"
         },
         {
            "question": "9",
            "value":"Cette évaluation est hyper inutile, à refuser."
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
    "errors": [
      {
        "message": "The proposal was modified. Please refresh the page.",
        "category": @string@,
        "locations": [
          @...@
        ],
        "path": [
          @...@
        ]
      }
    ],
    "data": {
      "changeProposalEvaluation": null
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
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "version": 1,
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
          "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
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

@database
Scenario: Evaluer wants to update the evaluation of a proposal and the version should be increased
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
   """
  {
    "query": "mutation ($input: ChangeProposalEvaluationInput!) {
      changeProposalEvaluation(input: $input) {
        proposal {
          id
          evaluation {
            version
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
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "version": 1,
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
          "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
          "evaluation": {
            "version": 2,
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

@database
Scenario: Evaluer should be prompted to refresh page if someone has already modified an evaluation since
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
  "query": "mutation ($input: ChangeProposalEvaluationInput!) {
    changeProposalEvaluation(input: $input) {
      proposal {
        id
        evaluation {
          version
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
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwy",
      "version": 1,
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
        "id": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "evaluation": {
          "version": 2,
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
          },
          {"question":{"id":"47"},"value":null}
          ]
        }
      }
    }
  }
  }
  """
  And I send a GraphQL POST request:
  """
  {
  "query": "mutation ($input: ChangeProposalEvaluationInput!) {
    changeProposalEvaluation(input: $input) {
      proposal {
        id
        evaluation {
          version
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
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwy",
      "version": 1,
      "responses": [
         {
            "question": "8",
            "value":"Encore une modification de l'évaluation"
         },
         {
            "question": "9",
            "value":"Cette évaluation est hyper inutile, à refuser."
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
    "errors": [
      {
        "message": "The proposal was modified. Please refresh the page.",
        "category": @string@,
        "locations": [
          @...@
        ],
        "path": [
          @...@
        ]
      }
    ],
    "data": {
      "changeProposalEvaluation": null
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
        "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwy",
        "version": 1,
        "responses": []
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"You are not an evaluer of proposal with id UHJvcG9zYWw6cHJvcG9zYWwy","category":@string@,"locations":[{"line":1,"column":55}],"path":["changeProposalEvaluation"]}],"data":{"changeProposalEvaluation":null}}
  """
