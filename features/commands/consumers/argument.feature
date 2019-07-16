@consumers
Feature: Argument consumers

@rabbitmq @snapshot
Scenario: Moderator should receive a new argument email if active moderation is enabled
  Given I publish in "argument_create" with message below:
  """
  { "argumentId": "argument206" }
  """
  When I consume "argument_create"
  Then I open mail with subject 'notification-subject-new-argument {"{proposalTitle}":"Article 1","{authorName}":"lbrunet"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And email should match snapshot 'createArgumentModeration.html'

@rabbitmq
Scenario: Moderator should not receive a new argument email if active moderation is disabled
  Given I publish in "argument_create" with message below:
  """
  { "argumentId": "argument1" }
  """
  When I consume "argument_create"
  Then 0 mail should be sent

@rabbitmq @snapshot
Scenario: Moderator should receive an updated argument email if active moderation is enabled
  Given I publish in "argument_update" with message below:
  """
  { "argumentId": "argument207" }
  """
  When I consume "argument_update"
  Then I open mail with subject 'notification-subject-modified-argument {"{proposalTitle}":"Article 1","{authorName}":"lbrunet"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And email should match snapshot 'updateArgumentModeration.html'

@rabbitmq
Scenario: Moderator should not receive an updated argument email if active moderation is disabled
  Given I publish in "argument_update" with message below:
  """
  { "argumentId": "argument1" }
  """
  When I consume "argument_update"
  Then 0 mail should be sent

@rabbitmq @snapshot
Scenario: Author should receive a trashed argument email
  Given I publish in "argument_trash" with message below:
  """
  { "argumentId": "argument208" }
  """
  When I consume "argument_trash"
  Then 1 mail should be sent
  And I open mail with subject 'notification-subject-argument-trashed {"{proposalTitle}":"Article 1"}' from "assistance@cap-collectif.com" to "lbrunet@jolicode.com"
  And email should match snapshot 'trashedArgumentAuthor.html'
