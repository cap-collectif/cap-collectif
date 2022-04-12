@project @read-only
Feature: Project

Scenario: GraphQL user get consultation step of project.
  Given I send a GraphQL POST request:
  """
  {
    "query": "query getProjectConsultationStepOpen($projectId: ID!) {
      node(id: $projectId) {
        ... on Project {
          consultationStepOpen {
            title
          }
        }
      }
    }",
    "variables": {
      "projectId": "UHJvamVjdDpwcm9qZWN0Mg=="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "node":{
        "consultationStepOpen":{
          "title": "Étape de multi-consultation"
        }
      }
    }
  }
  """