@consumers
Feature: Proposal consumers

@rabbitmq
Scenario: Email should be sent if a message is sent to the proposal_create queue
  Given I publish in "proposal_create" with message below:
  """
  {
    "proposalId": "proposal1"
  }
  """
  And I run "swarrot:consume:proposal_create proposal_create --env=test --max-execution-time=3"
  Then I open mail with subject "notification.email.proposal.create.subject"
  And I should see "notification.email.proposal.create.body" in mail

@rabbitmq
Scenario: Email should be sent if a message is sent to the proposal_delete queue
  Given I publish in "proposal_delete" with message below:
  """
  {
    "proposalId": "deletedProposal1"
  }
  """
  And I run "swarrot:consume:proposal_delete proposal_delete --env=test --max-execution-time=3"
  Then I open mail with subject "notification.email.proposal.delete.subject"
  And I should see "notification.email.proposal.delete.body" in mail

@rabbitmq
Scenario: Email should be sent if a message is sent to the proposal_update queue
  Given I publish in "proposal_update" with message below:
  """
  {
    "proposalId": "proposal10"
  }
  """
  And I run "swarrot:consume:proposal_update proposal_update --env=test --max-execution-time=3"
  Then I open mail with subject "notification.email.proposal.update.subject"
  And I should see "notification.email.proposal.update.body" in mail
