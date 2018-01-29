@consumers
Feature: Opinion consumers

@rabbitmq
Scenario: Moderator should receive a new opinion email if active moderation is enabled
  Given I publish in "opinion_create" with message below:
  """
  { "opinionId": "opinion1" }
  """
  When I consume "opinion_create"
  Then I open mail with subject 'notification-subject-new-proposal {"{projectName}":"Projet de loi Renseignement","{authorName}":"user"}' from "assistance@cap-collectif.com" to "assistance@cap-collectif.com"
  And I should see 'notification-content-new-proposal {"{title}":"Nouveau titre","{body}":"Mes modifications blablabla","{createdDate}":"25\/01\/2018","{createdTime}":"19:06:24","{authorName}":"user","{authorLink}":"http:\/\/capco.dev\/profile\/user","{opinionLink}":"http:\/\/capco.dev\/consultations\/projet-de-loi-renseignement\/consultation\/elaboration-de-la-loi\/opinions\/les-enjeux\/nouveau-titre"}' in mail

@rabbitmq
Scenario: Moderator should not receive a new opinion email if active moderation is disabled
  Given I publish in "opinion_create" with message below:
  """
  { "opinionId": "opinion1" }
  """
  When I consume "opinion_create"
  Then 0 emails should be sent

@rabbitmq
Scenario: Moderator should receive an updated opinion email if active moderation is enabled
  Given I publish in "opinion_update" with message below:
  """
  { "opinionId": "opinion1" }
  """
  When I consume "opinion_update"
  Then I open mail with subject 'notification-subject-updated-proposal {"%authorName%":"user","%projectName%":"Projet de loi Renseignement"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And I should see "notification-content-updated-proposal {}" in mail

@rabbitmq
Scenario: Moderator should not receive an updated opinion email if active moderation is disabled
  Given I publish in "opinion_update" with message below:
  """
  { "opinionId": "opinion1" }
  """
  When I consume "opinion_update"
  Then 0 emails should be sent
