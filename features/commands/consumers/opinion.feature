@consumers
Feature: Opinion consumers

@rabbitmq
Scenario: Moderator should receive a new opinion email if active moderation is enabled
  Given I publish in "opinion_create" with message below:
  """
  { "opinionId": "opinion60" }
  """
  When I consume "opinion_create"
  Then I open mail with subject 'notification-subject-new-proposal {"{proposalTitle}":"Article","{authorName}":"sfavot"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And I should see 'notification-content-new-proposal {"{title}":"Article","{body}":"Super opinion de malade","{createdDate}":"01\/03\/2016","{createdTime}":"00:00:00","{authorName}":"sfavot","{authorLink}":"https:\/\/capco.dev\/profile\/sfavot","{opinionLink}":"https:\/\/capco.dev\/consultations\/projet-de-loi-renseignement\/consultation\/elaboration-de-la-loi\/opinions\/titre-ier-la-circulation-des-donnees-et-du-savoir\/chapitre-ier-economie-de-la-donnee\/section-1-ouverture-des-donnees-publiques\/sous-partie-1\/article","{moderateSexualLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.sexual","{moderateOffendingLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.offending","{moderateInfringementLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/infringement-of-rights","{moderateSpamLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.spam","{moderateOffTopicLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.off_topic","{moderateGuidelineViolationLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/moderation-guideline-violation"}' in mail
  And I should see 'notification.email.moderator_footer {"{to}":"dev@cap-collectif.com","{sitename}":"Cap-Collectif","{siteUrl}":"https:\/\/capco.dev\/","{business}":"Cap Collectif","{businessUrl}":"https:\/\/cap-collectif.com\/"}' in mail

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
  Then I open mail with subject 'notification-subject-modified-proposal {"{proposalTitle}":"Article","{authorName}":"sfavot"}' from "assistance@cap-collectif.com" to "dev@cap-collectif.com"
  And I should see 'notification-content-modified-proposal {"{title}":"Article","{body}":"Super opinion de malade","{updatedDate}":"01\/03\/2017","{updatedTime}":"00:00:00","{authorName}":"sfavot","{authorLink}":"https:\/\/capco.dev\/profile\/sfavot","{opinionLink}":"https:\/\/capco.dev\/consultations\/projet-de-loi-renseignement\/consultation\/elaboration-de-la-loi\/opinions\/titre-ier-la-circulation-des-donnees-et-du-savoir\/chapitre-ier-economie-de-la-donnee\/section-1-ouverture-des-donnees-publiques\/sous-partie-1\/article","{moderateSexualLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.sexual","{moderateOffendingLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.offending","{moderateInfringementLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/infringement-of-rights","{moderateSpamLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.spam","{moderateOffTopicLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/reporting.status.off_topic","{moderateGuidelineViolationLink}":"https:\/\/capco.dev\/moderate\/opinion60ModerationToken\/reason\/moderation-guideline-violation"}' in mail
  And I should see 'notification.email.moderator_footer {"{to}":"dev@cap-collectif.com","{sitename}":"Cap-Collectif","{siteUrl}":"https:\/\/capco.dev\/","{business}":"Cap Collectif","{businessUrl}":"https:\/\/cap-collectif.com\/"}' in mail

@rabbitmq
Scenario: Moderator should not receive an updated opinion email if active moderation is disabled
  Given I publish in "opinion_update" with message below:
  """
  { "opinionId": "opinion1" }
  """
  When I consume "opinion_update"
  Then 0 mail should be sent

@rabbitmq
Scenario: Author should receive a trashed opinion email
  Given I publish in "opinion_trash" with message below:
  """
  { "opinionId": "opinion63" }
  """
  When I consume "opinion_trash"
  Then 1 mail should be sent
  And I open mail with subject 'notification-subject-proposal-in-the-trash {"{title}":"Article visible \u00e0 la corbeille"}' from 'assistance@cap-collectif.com' to 'sfavot@jolicode.com'
  And I should see 'notification-content-proposal-in-the-trash {"{trashedReason}":"reporting.status.spam","{title}":"Article visible \u00e0 la corbeille","{body}":"Je suis du spam","{trashedDate}":"01\/03\/2017","{trashedTime}":"00:00:00","{opinionLink}":"https:\/\/capco.dev\/consultations\/projet-de-loi-renseignement\/consultation\/elaboration-de-la-loi\/opinions\/titre-ier-la-circulation-des-donnees-et-du-savoir\/chapitre-ier-economie-de-la-donnee\/section-1-ouverture-des-donnees-publiques\/sous-partie-1\/article-visible-a-la-corbeille"}' in mail
  And I should see 'notification.email.external_footer {"{to}":"sfavot@jolicode.com","{sitename}":"Cap-Collectif","{siteUrl}":"https:\/\/capco.dev\/","{businessUrl}":"https:\/\/cap-collectif.com","{business}":"Cap Collectif"}' in mail
