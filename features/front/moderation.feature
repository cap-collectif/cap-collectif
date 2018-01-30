@moderation
Feature: Moderation

@security
Scenario: Hacker wants to moderate with a random token
  Given I go to "/moderate/iamahackerlolilol/reason/reporting.status.sexual"
  Then I should see 'error.404.title {"%code%":404}'

@security
Scenario: Moderator wants to moderate with a random reason
  Given I go to "/moderate/opinion1ModerationToken/reason/jesuispasok"
  Then I should see 'error.404.title {"%code%":404}'

@database @javascript
Scenario: Moderator wants to moderate and hide an opinion via email link
  Given I go to "/moderate/opinion1ModerationToken/reason/reporting.status.sexual"
  Then I should be redirected to "/projects/croissance-innovation-disruption/trashed"
  And I should see "the-proposal-has-been-successfully-moved-to-the-trash"
  And 1 mail should be sent
  And I open mail with subject 'notification-subject-proposal-in-the-trash {"{title}":"Opinion 1","%sitename%":"Cap-Collectif"}' from 'assistance@cap-collectif.com' to 'lbrunet@jolicode.com'
  #Then I should see 'notification-proposal-in-the-trash {"{trashedReason}":"reporting.status.sexual","{title}":"Opinion 1","{body}":"On va bient\u00f4t me mettre \u00e0 la corbeille","{trashedDate}":"@string@","{trashedTime}":"@string@","{opinionLink}":"http:\/\/capco.test\/consultations\/croissance-innovation-disruption\/consultation\/collecte-des-avis\/opinions\/le-probleme-constate\/opinion-1"}' in mail
  #And I should see 'notification.email.external_footer {"%to%":"lbrunet@jolicode.com","%sitename%":"Cap-Collectif"}' in mail

@database @javascript
Scenario: Moderator wants to moderate an opinion via email link
  Given I go to "/moderate/opinion1ModerationToken/reason/moderation-guideline-violation"
  Then I should be redirected to "/projects/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/le-probleme-constate/opinion-1"
  #And I should see "the-proposal-has-been-successfully-moved-to-the-trash"
  #And I should see "in-the-trash"
  And 1 mail should be sent
  And I open mail with subject 'notification-subject-proposal-in-the-trash {"{title}":"Opinion 1","%sitename%":"Cap-Collectif"}' from 'assistance@cap-collectif.com' to 'lbrunet@jolicode.com'
  #Then I should see 'notification-proposal-in-the-trash {"{trashedReason}":"reporting.status.sexual","{title}":"Opinion 1","{body}":"On va bient\u00f4t me mettre \u00e0 la corbeille","{trashedDate}":"@string@","{trashedTime}":"@string@","{opinionLink}":"http:\/\/capco.test\/consultations\/croissance-innovation-disruption\/consultation\/collecte-des-avis\/opinions\/le-probleme-constate\/opinion-1"}' in mail
  #And I should see 'notification.email.external_footer {"%to%":"lbrunet@jolicode.com","%sitename%":"Cap-Collectif"}' in mail

@database @javascript
Scenario: Moderator wants to moderate and hide a version via email link
  Given I go to "/moderate/version1ModerationToken/reason/reporting.status.sexual"
  Then I should be redirected to "/projects/projet-de-loi-renseignement/trashed"
  And I should see "the-proposal-has-been-successfully-moved-to-the-trash"

@database @javascript
Scenario: Moderator wants to moderate a version via email link
  Given I go to "/moderate/version1ModerationToken/reason/moderation-guideline-violation"
  Then I should be redirected to "/projects/projet-de-loi-renseignement/consultation/elaboration-de-la-loi/opinions/titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/article-1/versions/modification-1"
  And I should see "the-proposal-has-been-successfully-moved-to-the-trash"

@database @javascript
Scenario: Moderator wants to moderate and hide an argument via email link
  Given I go to "/moderate/argument1ModerationToken/reason/reporting.status.sexual"
  Then I should be redirected to "/projects/croissance-innovation-disruption/trashed"
  And I should see "the-argument-has-been-successfully-moved-to-the-trash"
  And 1 mail should be sent
  And I wait 15 seconds
  And I open mail with subject 'notification-subject-argument-trashed {"{proposalTitle}":"Opinion 2","%sitename%":"Cap-Collectif"}' from "assistance@cap-collectif.com" to "user@test.com"
  #Then I should see 'notification-argument-trashed {"{trashedReason}":"reporting.status.sexual","{body}":"Coucou, je suis un bel argument !","{trashedDate}":"@string@","{trashedTime}":"@string@","{argumentLink}":"http:\/\/capco.test\/consultations\/croissance-innovation-disruption\/consultation\/collecte-des-avis\/opinions\/les-causes\/opinion-2#arg-argument1"}' in mail

@database @javascript
Scenario: Moderator wants to moderate an opinion via email link
  Given I go to "/moderate/argument1ModerationToken/reason/moderation-guideline-violation"
  Then I should be redirected to "/projects/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/les-causes/opinion-2#arg-argument1"
  And I should see "the-argument-has-been-successfully-moved-to-the-trash"
  And 1 mail should be sent
  And I open mail with subject 'notification-subject-argument-trashed {"%title%":"Opinion 2"}' from "assistance@cap-collectif.com" to "lbrunet@jolicode.com"
  Then I should see "notification-content-proposal-in-the-trash {}" in mail
