@consumers
Feature: Argument consumers

@rabbitmq
Scenario: Moderator should receive a new argument email if active moderation is enabled
  Given I publish in "argument_create" with message below:
  """
  { "argumentId": "argument206" }
  """
  When I consume "argument_create"
  Then I open mail with subject 'notification-subject-new-argument {"{proposalTitle}":"Article 1","{authorName}":"lbrunet"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And I should see 'notification-content-new-argument {"{type}":"argument.show.type.for","{body}":"Que la force soit avec toi.","{createdDate}":"01\/03\/2016","{createdTime}":"00:00:00","{authorName}":"lbrunet","{authorLink}":"https:\/\/capco.dev\/profile\/lbrunet","{argumentLink}":"https:\/\/capco.dev\/consultations\/projet-de-loi-renseignement\/consultation\/elaboration-de-la-loi\/opinions\/chapitre-ier-economie-de-la-donnee\/section-1-ouverture-des-donnees-publiques\/article-1#arg-argument206","{moderateSexualLink}":"https:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/reporting.status.sexual","{moderateOffendingLink}":"https:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/reporting.status.offending","{moderateInfringementLink}":"https:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/infringement-of-rights","{moderateSpamLink}":"https:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/reporting.status.spam","{moderateOffTopicLink}":"https:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/reporting.status.off_topic","{moderateGuidelineViolationLink}":"https:\/\/capco.dev\/moderate\/argument206ModerationToken\/reason\/moderation-guideline-violation"}notification.email.moderator_footer {"{to}":"dev@cap-collectif.com","{sitename}":"Cap-Collectif","{siteUrl}":"https:\/\/capco.dev\/","{business}":"Cap Collectif","{businessUrl}":"https:\/\/cap-collectif.com\/"}' in mail
  And I should see 'notification.email.moderator_footer {"{to}":"dev@cap-collectif.com","{sitename}":"Cap-Collectif","{siteUrl}":"https:\/\/capco.dev\/","{business}":"Cap Collectif","{businessUrl}":"https:\/\/cap-collectif.com\/"}' in mail

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
  Then I open mail with subject 'notification-subject-modified-argument {"{proposalTitle}":"Article 1","{authorName}":"lbrunet"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And I should see 'notification-content-modified-argument {"{type}":"argument.show.type.for","{body}":"Que la force soit avec toi et avec Yoda.","{updatedDate}":"01\/03\/2017","{updatedTime}":"00:00:00","{authorName}":"lbrunet","{authorLink}":"https:\/\/capco.dev\/profile\/lbrunet","{argumentLink}":"https:\/\/capco.dev\/consultations\/projet-de-loi-renseignement\/consultation\/elaboration-de-la-loi\/opinions\/chapitre-ier-economie-de-la-donnee\/section-1-ouverture-des-donnees-publiques\/article-1#arg-argument207","{moderateSexualLink}":"https:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/reporting.status.sexual","{moderateOffendingLink}":"https:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/reporting.status.offending","{moderateInfringementLink}":"https:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/infringement-of-rights","{moderateSpamLink}":"https:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/reporting.status.spam","{moderateOffTopicLink}":"https:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/reporting.status.off_topic","{moderateGuidelineViolationLink}":"https:\/\/capco.dev\/moderate\/argument207ModerationToken\/reason\/moderation-guideline-violation"}notification.email.moderator_footer {"{to}":"dev@cap-collectif.com","{sitename}":"Cap-Collectif","{siteUrl}":"https:\/\/capco.dev\/","{business}":"Cap Collectif","{businessUrl}":"https:\/\/cap-collectif.com\/"}' in mail
  And I should see 'notification.email.moderator_footer {"{to}":"dev@cap-collectif.com","{sitename}":"Cap-Collectif","{siteUrl}":"https:\/\/capco.dev\/","{business}":"Cap Collectif","{businessUrl}":"https:\/\/cap-collectif.com\/"}' in mail

@rabbitmq
Scenario: Moderator should not receive an updated argument email if active moderation is disabled
  Given I publish in "argument_update" with message below:
  """
  { "argumentId": "argument1" }
  """
  When I consume "argument_update"
  Then 0 mail should be sent

@rabbitmq
Scenario: Author should receive a trashed argument email
  Given I publish in "argument_trash" with message below:
  """
  { "argumentId": "argument208" }
  """
  When I consume "argument_trash"
  Then 1 mail should be sent
  And I open mail with subject 'notification-subject-argument-trashed {"{proposalTitle}":"Article 1"}' from "assistance@cap-collectif.com" to "lbrunet@jolicode.com"
  And I should see 'notification-content-argument-trashed {"{trashedReason}":"moderation-guideline-violation","{body}":"Le spam c cool","{trashedDate}":"01\/03\/2017","{trashedTime}":"00:00:00","{argumentLink}":"https:\/\/capco.dev\/consultations\/projet-de-loi-renseignement\/consultation\/elaboration-de-la-loi\/opinions\/chapitre-ier-economie-de-la-donnee\/section-1-ouverture-des-donnees-publiques\/article-1#arg-argument208"}notification.email.external_footer {"{to}":"lbrunet@jolicode.com","{sitename}":"Cap-Collectif","{siteUrl}":"https:\/\/capco.dev\/","{businessUrl}":"https:\/\/cap-collectif.com","{business}":"Cap Collectif"}' in mail
  And I should see 'notification.email.external_footer {"{to}":"lbrunet@jolicode.com","{sitename}":"Cap-Collectif","{siteUrl}":"https:\/\/capco.dev\/","{businessUrl}":"https:\/\/cap-collectif.com","{business}":"Cap Collectif"}' in mail
