@node
Feature: Node

Scenario: GraphQL client want to get a node of all available types
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($opinionId: ID!, $proposalId: ID!, $projectId: ID!, $groupId: ID!, $proposalFormId: ID!, $questionnaireId: ID!, $eventId: ID!, $requirementId: ID!, $questionId: ID!, $responseId: ID!, $districtId: ID!, $organizationId: ID!){
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
      question: node(id: $questionId) {
        ... on Question {
          id
        }
      }
      response: node(id: $responseId) {
        ... on ValueResponse {
          id
          __typename
        }
      }
      district: node(id: $districtId) {
        ... on District {
          id
          __typename
        }
      }
      organization: node(id: $organizationId) {
        ... on Organization {
          id
          __typename
        }
      }
    }",
    "variables": {
      "opinionId": "opinion1",
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwx",
      "projectId": "UHJvamVjdDpwcm9qZWN0MQ==",
      "groupId": "R3JvdXA6Z3JvdXAx",
      "proposalFormId": "proposalForm1",
      "questionnaireId": "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlMQ==",
      "eventId": "RXZlbnQ6ZXZlbnQx",
      "requirementId": "UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQx",
      "questionId": "UXVlc3Rpb246Mg==",
      "responseId": "VmFsdWVSZXNwb25zZTpyZXNwb25zZVRhZ0Nsb3VkMjk=",
      "districtId": "RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx",
      "organizationId": "T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjE="
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "opinion":{
           "title":"Opinion 1"
        },
        "proposal":{
           "title":"Ravalement de la fa\u00e7ade de la biblioth\u00e8que municipale"
        },
        "project":{
           "title":"Croissance, innovation, disruption"
        },
        "group":null,
        "form":{
           "title":"Collecte des propositions pour le budget 2016 de la Ville de Rennes"
        },
        "questionnaire":{
           "title":"Votre avis sur les JO 2024 \u00e0 Paris"
        },
        "event":{
           "title":"Event with registrations"
        },
        "requirement":{
           "id":"UmVxdWlyZW1lbnQ6cmVxdWlyZW1lbnQx"
        },
        "question":{
           "id":"UXVlc3Rpb246Mg=="
        },
        "response":{
           "id":"VmFsdWVSZXNwb25zZTpyZXNwb25zZVRhZ0Nsb3VkMjk=",
           "__typename":"ValueResponse"
        },
        "district":{
           "id":"RGlzdHJpY3Q6Z2xvYmFsRGlzdHJpY3Qx",
           "__typename":"GlobalDistrict"
        },
        "organization":{
           "id":"T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjE=",
           "__typename":"Organization"
        }
     }
  }
  """

Scenario: Admin GraphQL client want to get nodes from a restricted project
  Given I am logged in to graphql as admin
  When I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalId: ID!, $projectId: ID!){
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
    }",
    "variables": {
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwzNA==",
      "projectId": "UHJvamVjdDpQcm9qZWN0QWNjZXNzaWJsZUZvck1lT25seUJ5QWRtaW4="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "proposal": {
        "title": "Quel type de bière ?"
      },
      "project": {
        "title": "Project pour la création de la capCoBeer (visible par admin seulement)"
      }
    }
  }
  """

Scenario: Anonymous GraphQL client want to get nodes from a private project
  Given I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalId: ID!, $projectId: ID!){
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
    }",
    "variables": {
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwzNA==",
      "projectId": "UHJvamVjdDpQcm9qZWN0QWNjZXNzaWJsZUZvck1lT25seUJ5QWRtaW4="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "proposal":null,
      "project":null
    }
  }
  """

Scenario: Not allowed GraphQL client want to get nodes from a private project
  Given I am logged in to graphql as pierre
  When I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalId: ID!, $projectId: ID!){
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
    }",
    "variables": {
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwzNA==",
      "projectId": "UHJvamVjdDpQcm9qZWN0QWNjZXNzaWJsZUZvck1lT25seUJ5QWRtaW4="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "proposal":null,
      "project":null
    }
  }
  """

Scenario: Super Admin GraphQL client want to get nodes from a private project
  Given I am logged in to graphql as super admin
  When I send a GraphQL POST request:
  """
  {
    "query": "query node ($proposalId: ID!, $projectId: ID!){
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
    }",
    "variables": {
      "proposalId": "UHJvcG9zYWw6cHJvcG9zYWwzNA==",
      "projectId": "UHJvamVjdDpQcm9qZWN0QWNjZXNzaWJsZUZvck1lT25seUJ5QWRtaW4="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "proposal": {
        "title": "Quel type de bière ?"
      },
      "project": {
        "title": "Project pour la création de la capCoBeer (visible par admin seulement)"
      }
    }
  }
  """
