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
              "question": "UXVlc3Rpb246OA==",
              "value":"Modification de l'évaluation"
           },
           {
              "question": "UXVlc3Rpb246OQ==",
              "value":"Cette évaluation est hyper utile, à accepter."
           },
           {
              "question": "UXVlc3Rpb246MjA=",
              "value":"{\"labels\":\"Au top\",\"other\":null}"},
           {
              "question": "UXVlc3Rpb246MjE=",
              "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
           },
           {
              "question": "UXVlc3Rpb246MjI=",
              "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
           },
           {
              "question": "UXVlc3Rpb246MjM=",
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
               "question": { "id": "UXVlc3Rpb246OA==" },
               "value":"Modification de l'évaluation"
            },
            {
               "question": { "id": "UXVlc3Rpb246OQ==" },
               "value":"Cette évaluation est hyper utile, à accepter."
            },
            {
               "question": { "id": "UXVlc3Rpb246MjA=" },
               "value":"{\"labels\":\"Au top\",\"other\":null}"},
            {
               "question": { "id": "UXVlc3Rpb246MjE=" },
               "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
            },
            {
               "question": { "id": "UXVlc3Rpb246MjI=" },
               "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
            },
            {
               "question": { "id": "UXVlc3Rpb246MjM=" },
               "value":"{\"labels\":[\"Réalisable\",\"Importante\"],\"other\":null}"
            },
            {
              "question": {"id":"UXVlc3Rpb246NDc="},
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
              "question": "UXVlc3Rpb246OA==",
              "value":"Modification de l'évaluation"
           },
           {
              "question": "UXVlc3Rpb246OQ==",
              "value":"Cette évaluation est hyper utile, à accepter."
           },
           {
              "question": "UXVlc3Rpb246MjA=",
              "value":"{\"labels\":\"Au top\",\"other\":null}"},
           {
              "question": "UXVlc3Rpb246MjE=",
              "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
           },
           {
              "question": "UXVlc3Rpb246MjI=",
              "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
           },
           {
              "question": "UXVlc3Rpb246MjM=",
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
               "question": { "id": "UXVlc3Rpb246OA==" },
               "value":"Modification de l'évaluation"
            },
            {
               "question": { "id": "UXVlc3Rpb246OQ==" },
               "value":"Cette évaluation est hyper utile, à accepter."
            },
            {
               "question": { "id": "UXVlc3Rpb246MjA=" },
               "value":"{\"labels\":\"Au top\",\"other\":null}"},
            {
               "question": { "id": "UXVlc3Rpb246MjE=" },
               "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
            },
            {
               "question": { "id": "UXVlc3Rpb246MjI=" },
               "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
            },
            {
               "question": { "id": "UXVlc3Rpb246MjM=" },
               "value":"{\"labels\":[\"Réalisable\",\"Importante\"],\"other\":null}"
            },
            {
              "question": {"id":"UXVlc3Rpb246NDc="},
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
            "question": "UXVlc3Rpb246OA==",
            "value":"Modification de l'évaluation"
         },
         {
            "question": "UXVlc3Rpb246OQ==",
            "value":"Cette évaluation est hyper utile, à accepter."
         },
         {
            "question": "UXVlc3Rpb246MjA=",
            "value":"{\"labels\":\"Au top\",\"other\":null}"},
         {
            "question": "UXVlc3Rpb246MjE=",
            "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
         },
         {
            "question": "UXVlc3Rpb246MjI=",
            "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
         },
         {
            "question": "UXVlc3Rpb246MjM=",
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
             "question": { "id": "UXVlc3Rpb246OA==" },
             "value":"Modification de l'évaluation"
          },
          {
             "question": { "id": "UXVlc3Rpb246OQ==" },
             "value":"Cette évaluation est hyper utile, à accepter."
          },
          {
             "question": { "id": "UXVlc3Rpb246MjA=" },
             "value":"{\"labels\":\"Au top\",\"other\":null}"},
          {
             "question": { "id": "UXVlc3Rpb246MjE=" },
             "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
          },
          {
             "question": { "id": "UXVlc3Rpb246MjI=" },
             "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
          },
          {
             "question": { "id": "UXVlc3Rpb246MjM=" },
             "value":"{\"labels\":[\"Réalisable\",\"Importante\"],\"other\":null}"
          },
          {
              "question": {"id":"UXVlc3Rpb246NDc="},
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
            "question": "UXVlc3Rpb246OA==",
            "value":"Encore une modification de l'évaluation"
         },
         {
            "question": "UXVlc3Rpb246OQ==",
            "value":"Cette évaluation est hyper inutile, à refuser."
         },
         {
            "question": "UXVlc3Rpb246MjA=",
            "value":"{\"labels\":\"Au top\",\"other\":null}"},
         {
            "question": "UXVlc3Rpb246MjE=",
            "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
         },
         {
            "question": "UXVlc3Rpb246MjI=",
            "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
         },
         {
            "question": "UXVlc3Rpb246MjM=",
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
           "question": "UXVlc3Rpb246OA==",
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
                "question": { "id": "UXVlc3Rpb246OA==" },
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
           "question": "UXVlc3Rpb246OA==",
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
                "question": { "id": "UXVlc3Rpb246OA==" },
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
            "question": "UXVlc3Rpb246OA==",
            "value":"Modification de l'évaluation"
         },
         {
            "question": "UXVlc3Rpb246OQ==",
            "value":"Cette évaluation est hyper utile, à accepter."
         },
         {
            "question": "UXVlc3Rpb246MjA=",
            "value":"{\"labels\":\"Au top\",\"other\":null}"},
         {
            "question": "UXVlc3Rpb246MjE=",
            "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
         },
         {
            "question": "UXVlc3Rpb246MjI=",
            "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
         },
         {
            "question": "UXVlc3Rpb246MjM=",
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
             "question": { "id": "UXVlc3Rpb246OA==" },
             "value":"Modification de l'évaluation"
          },
          {
             "question": { "id": "UXVlc3Rpb246OQ==" },
             "value":"Cette évaluation est hyper utile, à accepter."
          },
          {
             "question": { "id": "UXVlc3Rpb246MjA=" },
             "value":"{\"labels\":\"Au top\",\"other\":null}"},
          {
             "question": { "id": "UXVlc3Rpb246MjE=" },
             "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
          },
          {
             "question": { "id": "UXVlc3Rpb246MjI=" },
             "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
          },
          {
             "question": { "id": "UXVlc3Rpb246MjM=" },
             "value":"{\"labels\":[\"Réalisable\",\"Importante\"],\"other\":null}"
          },
          {"question":{"id":"UXVlc3Rpb246NDc="},"value":null}
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
            "question": "UXVlc3Rpb246OA==",
            "value":"Encore une modification de l'évaluation"
         },
         {
            "question": "UXVlc3Rpb246OQ==",
            "value":"Cette évaluation est hyper inutile, à refuser."
         },
         {
            "question": "UXVlc3Rpb246MjA=",
            "value":"{\"labels\":\"Au top\",\"other\":null}"},
         {
            "question": "UXVlc3Rpb246MjE=",
            "value":"{\"labels\":[\"Incohérente\",\"Que de la publicité (mensongère en plus !)\"],\"other\":null}"
         },
         {
            "question": "UXVlc3Rpb246MjI=",
            "value":"{\"labels\":[\"J'ai rien compris\"],\"other\":null}"
         },
         {
            "question": "UXVlc3Rpb246MjM=",
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
