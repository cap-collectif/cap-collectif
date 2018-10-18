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
                  "id": "proposal1"
                }
              },
              {
                "node": {
                  "id": "proposal2"
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
              {"id":"8"},
              {"id":"9"},
              {"id":"20"},
              {"id":"21"},
              {"id":"22"},
              {"id":"23"},
              {"id":"47"}
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
              {"id":"8"},
              {"id":"9"},
              {"id":"20"},
              {"id":"21"},
              {"id":"22"},
              {"id":"23"},
              {"id":"47"}
            ]
          }
       }
    }
  }
  """
