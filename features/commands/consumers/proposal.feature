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
  Then I open mail with subject "notification.proposal.create.subject"
  And I should see "notification.proposal.create.body" in mail
  Then I open mail with subject "acknowledgement-of-receipt"
  And I should see "your-proposal-has-been-registered" in mail

@rabbitmq
Scenario: Email should be sent if a message is sent to the proposal_delete queue
  Given I publish in "proposal_delete" with message below:
  """
  {
    "proposalId": "proposal12"
  }
  """
  And I consume "proposal_delete"
  Then I open mail with subject "notification.proposal.delete.subject"
  And I should see "notification.proposal.delete.body" in mail

@rabbitmq
Scenario: Email should be sent if a message is sent to the proposal_update queue
  Given I publish in "proposal_update" with message below:
  """
  {
    "proposalId": "proposal10"
  }
  """
  And I consume "proposal_update"
  Then I open mail with subject "notification.proposal.update.subject"
  And I should see "notification.proposal.update.body" in mail
  Then I open mail with subject "acknowledgement-of-receipt"
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
  Then I open mail with subject "notification.proposal.create.subject"
  And I should see "notification.proposal.create.body" in mail
  Then I should not see mail with subject "acknowledgement-of-receipt"

@rabbitmq
Scenario: Email should be sent if a message is sent to the proposal_update queue
  Given I publish in "proposal_update" with message below:
  """
  {
  "proposalId": "proposal22"
  }
  """
  And I consume "proposal_update"
  Then I open mail with subject "notification.proposal.update.subject"
  And I should see "notification.proposal.update.body" in mail
  Then I should not see mail with subject "acknowledgement-of-receipt"

@rabbitmq @snapshot-email
Scenario: I publish a proposal in draft without allowAknowledge
  Given I publish in "proposal_create" with message below:
  """
  {
  "proposalId": "proposal103"
  }
  """
  And I consume "proposal_create"
  Then I open mail with subject "notification.proposal.create.subject"
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
  Then I open mail with subject "notification.proposal.create.subject"
  And email should match snapshot "notifyProposal_publishedAllowedAknowledgeDraft.html"

@rabbitmq @snapshot-email
Scenario: Proposal author receive message after, admin updated status of his proposal
  Given I publish in "proposal_update_status" with message below:
  """
  {
    "proposalId": "proposal2",
    "date": "12-12-2012 12:12:12"
  }
  """
  And I consume "proposal_update_status"
  Then I open mail with subject 'proposal-notifier-new-status {"{proposalTitle}":"R\u00e9novation du gymnase","{proposalStatus}":"Vote gagn\u00e9"}'
  And email should match snapshot "notifyProposal_AuthorStatusChange.html"

@rabbitmq @snapshot-email
Scenario: Proposal english author receive message after, admin updated status of his proposal
  Given I publish in "proposal_update_status" with message below:
  """
  {
    "proposalId": "proposal108",
    "date": "12-12-2012 12:12:12"
  }
  """
  And I consume "proposal_update_status"
  Then I open mail to "john.smith@england.uk"
  And email should match snapshot "notifyProposal_AuthorStatusChangeEnglish.html"

@rabbitmq @snapshot-email
Scenario: analyst receive message after being assigned to a proposal
  Given I publish in "proposal_assignation" with message below:
  """
  {
    "assigned":"userMickael",
    "role":"admin.global.evaluers",
    "proposals":["proposal110"]
  }
  """
  And I consume "proposal_assignation"
  Then I open mail to "mickael@cap-collectif.com"
  And email should match snapshot "notifyAnalyst_NewAnalyst.html"

@rabbitmq @snapshot-email
Scenario: supervisor receive message after being assigned to two proposals
  Given I publish in "proposal_assignation" with message below:
  """
  {
    "assigned":"userMickael",
    "role":"tag.filter.opinion",
    "proposals":["proposal110", "proposal111"]
  }
  """
  And I consume "proposal_assignation"
  Then I open mail to "mickael@cap-collectif.com"
  And email should match snapshot "notifyAnalyst_NewSupervisor.html"

@rabbitmq @snapshot-email
Scenario: decisionMaker receive message after being assigned to a proposal
  Given I publish in "proposal_assignation" with message below:
  """
  {
    "assigned":"userMickael",
    "role":"tag.filter.decision",
    "proposals":["proposal110"]
  }
  """
  And I consume "proposal_assignation"
  Then I open mail to "mickael@cap-collectif.com"
  And email should match snapshot "notifyAnalyst_NewDecisionMaker.html"

@rabbitmq @snapshot-email
Scenario: someone receive message after being revoked from two proposals
  Given I publish in "proposal_revoke" with message below:
  """
  {
    "assigned":"userMickael",
    "proposals":["proposal110", "proposal111"]
  }
  """
  And I consume "proposal_revoke"
  Then I open mail to "mickael@cap-collectif.com"
  And email should match snapshot "notifyAnalyst_RevokeAnalyst.html"

@rabbitmq @snapshot-email @database
Scenario: analysts receive message when  proposal is updated
  Given I publish in "proposal_update" with message below:
  """
  {
    "proposalId": "proposal110",
    "date": "12-12-2012 12:12:12"
  }
  """
  And I consume "proposal_update"
  Then I open mail to "analyst2@cap-collectif.com"
  And email should match snapshot "notifyAnalyst_updateProposal"

@rabbitmq @snapshot-email
Scenario: deicisionmaker receive message when  proposal is deleted
  Given I publish in "proposal_delete" with message below:
  """
  {
    "proposalId": "deletedProposal1",
    "decisionMakerId": "userDecisionMaker"
  }
  """
  And I consume "proposal_delete"
  Then I open mail to "decisionmaker@cap-collectif.com"
  And email should match snapshot "notifyAnalyst_deleteProposal"

@rabbitmq
Scenario: decisionmaker receive message when assessment is published
  Given I publish in "proposal_analyse" with message below:
  """
  {
    "type": "assessment",
    "proposalId": "proposalIdf3",
    "date": "12-12-2012 12:12:12"
  }
  """
  And I consume "proposal_analyse"
  Then I should see mail to "aurelien@cap-collectif.com"
  And I should see mail with subject "notification.proposal.assessment.title"

@rabbitmq
Scenario: everyone receive message when decision is published
  Given I publish in "proposal_analyse" with message below:
  """
  {
    "type": "decision",
    "proposalId": "proposalIdf3",
    "date": "12-12-2012 12:12:12"
  }
  """
  And I consume "proposal_analyse"
  Then I should see mail to "maxime.pouessel@cap-collectif.com"
  And I should see mail to "theo@cap-collectif.com"
  And I should see mail to "maxime.auriau@cap-collectif.com"
  And I should see mail to "mickael@cap-collectif.com"
  And I should see mail with subject "notification.proposal.decision.title"

@rabbitmq @snapshot-email
Scenario: proposal author recive message when assigned user ask a revision on his proposal
  Given I publish in "proposal_revision" with message below:
  """
  {
    "proposalRevisionId": "proposalRevision2",
    "proposalId": "proposalIdf1"
  }
  """
  And I consume "proposal_revision"
  Then I should see mail to "pierre@cap-collectif.com"
  Then I open mail to "pierre@cap-collectif.com"
  And email should match snapshot "notifyProposalRevision.html"

@rabbitmq @snapshot-email
Scenario: assigned users and admin receive message when author revised his proposal
  Given I publish in "proposal_revision_revise" with message below:
  """
  {
    "proposalRevisionId": "proposalRevision2",
    "proposalId": "proposalIdf1",
    "date": "now"
  }
  """
  And I consume "proposal_revision_revise"
  Then I open mail to "aurelien@cap-collectif.com"
  And email should match snapshot "notifyProposalRevisionRevise.html"

@rabbitmq @snapshot-email
Scenario: User add an news on his proposal
  Given I publish in "proposal_news_create" with message below:
  """
  {
    "proposalNewsId": "post18"
  }
  """
  And I consume "proposal_news_create"
  Then I open mail to "admin@cap-collectif.com"
  And email should match snapshot "notifyCreateProposalNewsAdmin.html"

@rabbitmq @snapshot-email
Scenario: User update an news on his proposal
  Given I publish in "proposal_news_update" with message below:
  """
  {
    "proposalNewsId": "post18"
  }
  """
  And I consume "proposal_news_update"
  Then I open mail to "admin@cap-collectif.com"
  And email should match snapshot "notifyUpdateProposalNewsAdmin.html"

@rabbitmq @snapshot-email
Scenario: User delete an news on his proposal
  Given I publish in "proposal_news_delete" with message below:
  """
  {
    "proposalNewsId": "post18",
    "proposalName": "Il fait beau dehors",
    "projectName": "Le projet de la pluie et du beau temps",
    "postAuthor": "Senku"
  }
  """
  And I consume "proposal_news_delete"
  Then I open mail to "admin@cap-collectif.com"
  And email should match snapshot "notifyDeleteProposalNewsAdmin.html"

@rabbitmq @snapshot-email
Scenario: User participated in a proposal
  Given I publish in "proposal_create" with message below:
  """
  {
    "proposalId": "proposal1"
  }
  """
  And I consume "proposal_create"
  Then I open mail with subject "acknowledgement-of-receipt"
  And email should match snapshot "aknowledgeProposal.html"
