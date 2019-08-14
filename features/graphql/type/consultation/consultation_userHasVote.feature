@consultation_userHasVote
Feature: consultation_userHasVote

@read-only
Scenario: API client wants to know if a user has voted on the consultation
  Given I send a GraphQL POST request:
  """
  {
    "query": "query ($consultationId: ID!, $loginA: String!, $loginB: String!, $loginC: String!) {
      consultation: node(id: $consultationId) {
        ... on Consultation {
          spylHasVote: userHasVote(login: $loginA)
          lbrunetHasVote: userHasVote(login: $loginB)
          unknownUserHasVote: userHasVote(login: $loginC)
        }
      }
    }",
    "variables": {
      "consultationId": "Q29uc3VsdGF0aW9uOmRlZmF1bHQ=",
      "loginA": "aurelien@cap-collectif.com",
      "loginB": "lbrunet@jolicode.com",
      "loginC": "unknown@gmail.com"
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "consultation": {
        "spylHasVote": false,
        "lbrunetHasVote": true,
        "unknownUserHasVote": false
      }
    }
  }
  """
