@node
Feature: Node

Scenario: GraphQL client want to get a node of all available types
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($opinionId: ID!, $proposalId: ID!, $projectId: ID!, $groupId: ID!, $proposalFormId: ID!, $questionnaireId: ID!, $eventId: ID!, $requirementId: ID!){
      opinion: node(id: $opinionId) {
        ... on Opinion {
          title
        }
      }
      proposal: node(id: $proposalId) {
        ... on Proposal {
          title
        }
      }
      project: node(id: $projectId) {
        ... on Project {
          title
        }
      }
      group: node(id: $groupId) {
        ... on Group {
          title
        }
      }
      form: node(id: $proposalFormId) {
        ... on ProposalForm {
          title
        }
      }
      questionnaire: node(id: $questionnaireId) {
        ... on Questionnaire {
          title
        }
      }
      event: node(id: $eventId) {
        ... on Event {
          title
        }
      }
      requirement: node(id: $requirementId) {
        ... on Requirement {
          id
        }
      }
    }",
    "variables": {
      "opinionId": "opinion1",
      "proposalId": "proposal1",
      "projectId": "project1",
      "groupId": "group1",
      "proposalFormId": "proposalForm1",
      "questionnaireId": "questionnaire1",
      "eventId": "event1",
      "requirementId": "requirement1"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "opinion": {
        "title": "Opinion 1"
      },
      "proposal": {
        "title": "Ravalement de la fa\u00e7ade de la biblioth\u00e8que municipale"
      },
      "project": {
        "title": "Croissance, innovation, disruption"
      },
      "group": {
        "title": "Super-administrateur"
      },
      "form": {
        "title": "Collecte des propositions pour le budget 2016 de la Ville de Rennes"
      },
      "questionnaire": {
        "title": "Votre avis sur les JO 2024 à Paris"
      },
      "event": {
        "title": "Event with registrations"
      },
      "requirement": {
        "id": "requirement1"
      }
    }
  }
  """
