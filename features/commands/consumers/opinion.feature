@consumers
Feature: Opinion consumers

@rabbitmq
Scenario: Moderator should receive a new opinion email if active moderation is enabled
  Given I publish in "opinion_create" with message below:
  """
  { "opinionId": "opinion60" }
  """
  When I consume "opinion_create"
  Then I open mail with subject 'notification-subject-new-proposal {"{projectName}":"Projet de loi Renseignement","{authorName}":"sfavot","%sitename%":"Cap-Collectif"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And I should see 'notification-content-new-proposal {"{title}":"Article","{body}":"Super opinion de malade","{createdDate}":"01\/03\/2016","{createdTime}":"00:00:00","{authorName}":"sfavot","{authorLink}":"http:\/\/capco.dev\/profile\/sfavot","{opinionLink}":"http:\/\/capco.dev\/consultations\/projet-de-loi-renseignement\/consultation\/elaboration-de-la-loi\/opinions\/titre-ier-la-circulation-des-donnees-et-du-savoir\/chapitre-ier-economie-de-la-donnee\/section-1-ouverture-des-donnees-publiques\/sous-partie-1\/article","{moderateSexualLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.sexual","{moderateOffendingLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.offending","{moderateInfringementLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/infringement-of-rights","{moderateSpamLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.spam","{moderateOffTopicLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.off_topic","{moderateGuidelineViolationLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/moderation-guideline-violation"}' in mail
  And I should see 'notification.email.admin_footer {"%to%":"dev@cap-collectif.com","%sitename%":"Cap-Collectif"}' in mail

@rabbitmq
Scenario: Moderator should not receive a new opinion email if active moderation is disabled
  Given I publish in "opinion_create" with message below:
  """
  { "opinionId": "opinion1" }
  """
  When I consume "opinion_create"
  Then 0 mail should be sent

@rabbitmq
Scenario: Moderator should receive an updated opinion email if active moderation is enabled
  Given I publish in "opinion_update" with message below:
  """
  { "opinionId": "opinion60" }
  """
  When I consume "opinion_update"
  Then I open mail with subject 'notification-subject-modified-proposal {"{projectName}":"Projet de loi Renseignement","{authorName}":"sfavot","%sitename%":"Cap-Collectif"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And I should see 'notification-content-modified-proposal {"{title}":"Article","{body}":"Super opinion de malade","{updatedDate}":"01\/03\/2017","{updatedTime}":"00:00:00","{authorName}":"sfavot","{authorLink}":"http:\/\/capco.dev\/profile\/sfavot","{opinionLink}":"http:\/\/capco.dev\/consultations\/projet-de-loi-renseignement\/consultation\/elaboration-de-la-loi\/opinions\/titre-ier-la-circulation-des-donnees-et-du-savoir\/chapitre-ier-economie-de-la-donnee\/section-1-ouverture-des-donnees-publiques\/sous-partie-1\/article","{moderateSexualLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.sexual","{moderateOffendingLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.offending","{moderateInfringementLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/infringement-of-rights","{moderateSpamLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.spam","{moderateOffTopicLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.off_topic","{moderateGuidelineViolationLink}":"http:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/moderation-guideline-violation"}' in mail
  And I should see 'notification.email.admin_footer {"%to%":"dev@cap-collectif.com","%sitename%":"Cap-Collectif"}' in mail

@rabbitmq
Scenario: Moderator should not receive an updated opinion email if active moderation is disabled
  Given I publish in "opinion_update" with message below:
  """
  { "opinionId": "opinion1" }
  """
  When I consume "opinion_update"
  Then 0 mail should be sent
