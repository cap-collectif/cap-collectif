@consumers
Feature: Opinion consumers

@rabbitmq @snapshot
Scenario: Moderator should receive a new opinion email if active moderation is enabled
  Given I publish in "opinion_create" with message below:
  """
  { "opinionId": "opinion60" }
  """
  When I consume "opinion_create"
  Then I open mail with subject 'notification-subject-new-proposal {"{proposalTitle}":"Article","{authorName}":"sfavot"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And email should match snapshot 'createOnpinionModeration.html'

@rabbitmq
Scenario: Moderator should not receive a new opinion email if active moderation is disabled
  Given I publish in "opinion_create" with message below:
  """
  { "opinionId": "opinion1" }
  """
  When I consume "opinion_create"
  Then 0 mail should be sent

@rabbitmq @snapshot
Scenario: Moderator should receive an updated opinion email if active moderation is enabled
  Given I publish in "opinion_update" with message below:
  """
  { "opinionId": "opinion60" }
  """
  When I consume "opinion_update"
  Then I open mail with subject 'notification-subject-modified-proposal {"{proposalTitle}":"Article","{authorName}":"sfavot"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And email should match snapshot 'updateOnpinionModeration.html'

@rabbitmq
Scenario: Moderator should not receive an updated opinion email if active moderation is disabled
  Given I publish in "opinion_update" with message below:
  """
  { "opinionId": "opinion1" }
  """
  When I consume "opinion_update"
  Then 0 mail should be sent

@rabbitmq @snapshot
Scenario: Author should receive a trashed opinion email
  Given I publish in "opinion_trash" with message below:
  """
  { "opinionId": "opinion63" }
  """
  When I consume "opinion_trash"
  Then 1 mail should be sent
  And I open mail with subject 'notification-subject-proposal-in-the-trash {"{title}":"Article visible \u00e0 la corbeille"}' from 'assistance@cap-collectif.com' to 'sfavot@jolicode.com'
  And email should match snapshot 'trashedOnpinionAuthor.html'
