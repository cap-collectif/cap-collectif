@consumers
Feature: Argument consumers

@rabbitmq
Scenario: Moderator should receive a new argument email if active moderation is enabled
  Given I publish in "argument_create" with message below:
  """
  { "argumentId": "argument206" }
  """
  When I consume "argument_create"
  Then I open mail with subject 'notification-subject-new-argument {"{projectName}":"Article 1","{authorName}":"lbrunet","%sitename%":"Cap-Collectif"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And I should see 'notification-content-new-argument {"{type}":"FOR","{body}":"Que la force soit avec toi.","{createdDate}":"01\/03\/2016","{createdTime}":"00:00:00","{authorName}":"lbrunet","{authorLink}":"http:\/\/capco.dev\/profile\/lbrunet","{argumentLink}":"http:\/\/capco.dev\/consultations\/projet-de-loi-renseignement\/consultation\/elaboration-de-la-loi\/opinions\/titre-ier-la-circulation-des-donnees-et-du-savoir\/chapitre-ier-economie-de-la-donnee\/section-1-ouverture-des-donnees-publiques\/article-1#arg-argument206","{moderateSexualLink}":"http:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/reporting.status.sexual","{moderateOffendingLink}":"http:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/reporting.status.offending","{moderateInfringementLink}":"http:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/infringement-of-rights","{moderateSpamLink}":"http:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/reporting.status.spam","{moderateOffTopicLink}":"http:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/reporting.status.off_topic","{moderateGuidelineViolationLink}":"http:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/moderation-guideline-violation"}' in mail
  And I should see 'notification.email.admin_footer {"%to%":"dev@cap-collectif.com","%sitename%":"Cap-Collectif"}' in mail

@rabbitmq
Scenario: Moderator should not receive a new argument email if active moderation is disabled
  Given I publish in "argument_create" with message below:
  """
  { "argumentId": "argument1" }
  """
  When I consume "argument_create"
  Then 0 mail should be sent

@rabbitmq
Scenario: Moderator should receive an updated argument email if active moderation is enabled
  Given I publish in "argument_update" with message below:
  """
  { "argumentId": "argument207" }
  """
  When I consume "argument_update"
  Then I open mail with subject 'notification-subject-modified-argument {"{projectName}":"Article 1","{authorName}":"lbrunet","%sitename%":"Cap-Collectif"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And I should see 'notification-content-modified-argument {"{type}":"FOR","{body}":"Que la force soit avec toi et avec Yoda.","{updatedDate}":"01\/03\/2017","{updatedTime}":"00:00:00","{authorName}":"lbrunet","{authorLink}":"http:\/\/capco.dev\/profile\/lbrunet","{argumentLink}":"http:\/\/capco.dev\/consultations\/projet-de-loi-renseignement\/consultation\/elaboration-de-la-loi\/opinions\/titre-ier-la-circulation-des-donnees-et-du-savoir\/chapitre-ier-economie-de-la-donnee\/section-1-ouverture-des-donnees-publiques\/article-1#arg-argument207","{moderateSexualLink}":"http:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/reporting.status.sexual","{moderateOffendingLink}":"http:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/reporting.status.offending","{moderateInfringementLink}":"http:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/infringement-of-rights","{moderateSpamLink}":"http:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/reporting.status.spam","{moderateOffTopicLink}":"http:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/reporting.status.off_topic","{moderateGuidelineViolationLink}":"http:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/moderation-guideline-violation"}' in mail
  And I should see 'notification.email.admin_footer {"%to%":"dev@cap-collectif.com","%sitename%":"Cap-Collectif"}' in mail

@rabbitmq
Scenario: Moderator should not receive an updated argument email if active moderation is disabled
  Given I publish in "argument_update" with message below:
  """
  { "argumentId": "argument1" }
  """
  When I consume "argument_update"
  Then 0 mail should be sent
