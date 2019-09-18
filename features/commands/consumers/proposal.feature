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
  And I consume "proposal_create"
  Then I open mail with subject "notification.email.proposal.create.subject"
  And I should see "notification.email.proposal.create.body" in mail
  Then I open mail with subject "acknowledgment-of-receipt"
  And I should see "your-proposal-has-been-registered" in mail

@rabbitmq
Scenario: Email should be sent if a message is sent to the proposal_delete queue
  Given I publish in "proposal_delete" with message below:
  """
  {
    "proposalId": "UHJvcG9zYWw6ZGVsZXRlZFByb3Bvc2FsMQ=="
  }
  """
  And I consume "proposal_delete"
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
  And I consume "proposal_update"
  Then I open mail with subject "notification.email.proposal.update.subject"
  And I should see "notification.email.proposal.update.body" in mail
  Then I open mail with subject "acknowledgment-of-receipt"
  And I should see "you-have-modified-your-proposal" in mail

@rabbitmq
Scenario: Email should be sent if a message is sent to the proposal_create queue
  Given I publish in "proposal_create" with message below:
  """
  {
    "proposalId": "proposal22"
  }
  """
  And I consume "proposal_create"
  Then I open mail with subject "notification.email.proposal.create.subject"
  And I should see "notification.email.proposal.create.body" in mail
  Then I should not see mail with subject "acknowledgment-of-receipt"

@rabbitmq
Scenario: Email should be sent if a message is sent to the proposal_update queue
  Given I publish in "proposal_update" with message below:
  """
  {
  "proposalId": "proposal22"
  }
  """
  And I consume "proposal_update"
  Then I open mail with subject "notification.email.proposal.update.subject"
  And I should see "notification.email.proposal.update.body" in mail
  Then I should not see mail with subject "acknowledgment-of-receipt"

@rabbitmq @snapshot-email
Scenario: I publish a proposal in draft without allowAknowledge
  Given I publish in "proposal_create" with message below:
  """
  {
  "proposalId": "proposal103"
  }
  """
  And I consume "proposal_create"
  Then I open mail with subject "notification.email.proposal.create.subject"
  And email should match snapshot "notifyProposal_publishedDraft.html"

@rabbitmq @snapshot-email
Scenario: I publish a proposal in draft with allowAknowledge
  Given I publish in "proposal_create" with message below:
  """
  {
  "proposalId": "proposal104"
  }
  """
  And I consume "proposal_create"
  Then I open mail with subject "notification.email.proposal.create.subject"
  And email should match snapshot "notifyProposal_publishedAllowedAknowledgeDraft.html"

@rabbitmq @snapshot-email
Scenario: Proposal author receive message after, admin updated status of his proposal
  Given I publish in "proposal_update_status" with message below:
  """
  {
  "proposalId": "proposal2"
  }
  """
  And I consume "proposal_update_status"
  Then I open mail with subject 'proposal-notifier-new-status {"{proposalTitle}":"Rénovation du gymnase", "{proposalStatus}":"Approuvé"}'
  And email should match snapshot "notifyProposalAuthorStatusChange.html"
