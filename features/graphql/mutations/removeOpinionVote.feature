@opinions_votes
Feature: mutation removeOpinionVote

@security
Scenario: Logged in API client wants to remove a vote but has not voted
  Given I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveOpinionVoteInput!) {
      removeOpinionVote(input: $input) {
        opinion {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "opinionId": "opinion2"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "You have not voted for this opinion in this step.",
        "category": @string@,
        "locations": [{"line":1,"column":50}],
        "path": ["removeOpinionVote"]
      }
    ],
    "data": {
      "removeOpinionVote": null
    }
  }
  """

@security
Scenario: Logged in API client wants to remove a vote but has not voted
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveOpinionVoteInput!) {
      removeOpinionVote(input: $input) {
        opinion {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "selectionstep3",
        "opinionId": "opinion11"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "errors": [
      {
        "message": "This step is no longer contributable.",
        "category": @string@,
        "locations": [{"line":1,"column":50}],
        "path": ["removeOpinionVote"]
      }
    ],
    "data": {
      "removeOpinionVote": null
    }
  }
  """

@database
Scenario: Logged in API client wants to remove a vote
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: RemoveOpinionVoteInput!) {
      removeOpinionVote(input: $input) {
        opinion {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "stepId": "selectionstep4",
        "opinionId": "opinion7"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "removeOpinionVote": {
        "opinion": {
          "id": "opinion7"
        }
      }
    }
  }
  """
