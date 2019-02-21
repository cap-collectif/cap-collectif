@proposalForm
Feature: Proposal Forms

Scenario: GraphQL client wants to retrieve his evaluations
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
      proposalForm: node(id: "proposalForm1") {
        ... on ProposalForm {
          step {
            title
            project {
              title
            }
          }
          proposals(first: 10, affiliations: [EVALUER]) {
            totalCount
            edges {
              node {
                id
              }
            }
          }
        }
      }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "proposalForm": {
          "step": {
            "title": @string@,
            "project": {
              "title": @string@
            }
          },
          "proposals": {
            "totalCount": 2,
            "edges": [
              {
                "node": {
                  "id": "UHJvcG9zYWw6cHJvcG9zYWwx"
                }
              },
              {
                "node": {
                  "id": "UHJvcG9zYWw6cHJvcG9zYWwy"
                }
              }
            ]
          }
      }
    }
  }
  """

Scenario: Evaluer wants to retrieve evaluation form questions
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
      proposalForm: node(id: "proposalForm1") {
        ... on ProposalForm {
          evaluationForm {
            questions {
              id
            }
          }
        }
      }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "proposalForm": {
          "evaluationForm": {
            "questions": [
              {"id":"UXVlc3Rpb246OA=="},
              {"id":"UXVlc3Rpb246OQ=="},
              {"id":"UXVlc3Rpb246MjA="},
              {"id":"UXVlc3Rpb246MjE="},
              {"id":"UXVlc3Rpb246MjI="},
              {"id":"UXVlc3Rpb246MjM="},
              {"id":"UXVlc3Rpb246NDc="}
            ]
          }
       }
    }
  }
  """

Scenario: Anonymous wants to retrieve evaluation form questions
  Given I send a GraphQL request:
  """
  {
      proposalForm: node(id: "proposalForm1") {
        ... on ProposalForm {
          evaluationForm {
            questions {
              id
            }
          }  
        }
      }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
        "proposalForm": {
          "evaluationForm": {
            "questions": [
              {"id":"UXVlc3Rpb246OA=="},
              {"id":"UXVlc3Rpb246OQ=="},
              {"id":"UXVlc3Rpb246MjA="},
              {"id":"UXVlc3Rpb246MjE="},
              {"id":"UXVlc3Rpb246MjI="},
              {"id":"UXVlc3Rpb246MjM="},
              {"id":"UXVlc3Rpb246NDc="}
            ]
          }
       }
    }
  }
  """
