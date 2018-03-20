@changeCollectStatus
Feature: changeCollectStatus

@database @test
Scenario: GraphQL client wants to change proposal collect status
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
    {
      "query": "mutation ($input: ChangeCollectStatusInput!) {
        changeCollectStatus(input: $input) {
          proposal {
            status {
              id
            }
          }
        }
      }",
      "variables": {
        "input": {
          "proposalId": "proposal2",
          "statusId": "status3"
        }
      }
    }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "changeCollectStatus": {
        "proposal": {
          "status": {
            "id": "status3"
          }
        }
      }
    }
  }
  """
  And 1 mail should be sent
  And I open mail with subject 'proposal_status_change_collect.notification.subject'
  Then I should see 'proposal_status_change_collect.notification.body {"%sitename%":"Cap-Collectif","%project%":"Budget Participatif Rennes","%proposal%":"R\u00e9novation du gymnase","%status%":"Rejet\u00e9","%proposal_link%":"https:\/\/capco.test\/projects\/budget-participatif-rennes\/collect\/collecte-des-propositions\/proposals\/renovation-du-gymnase","%user%":"user"}' in mail
