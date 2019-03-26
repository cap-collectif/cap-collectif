@core @moderation
Feature: Moderation

@security
Scenario: Hacker wants to moderate with a random token
  Given I go to "/moderate/iamahackerlolilol/reason/reporting.status.sexual"
  Then I should see "error.404.title"

@security
Scenario: Moderator wants to moderate with a random reason
  Given I go to "/moderate/opinion1ModerationToken/reason/jesuispasok"
  Then I should see "error.404.title"

@database
Scenario: Moderator wants to moderate and hide an opinion via email link
  Given I go to "/moderate/opinion1ModerationToken/reason/reporting.status.sexual"
  Then I should be redirected to "/projects/croissance-innovation-disruption/trashed"
  And I should see "the-proposal-has-been-successfully-moved-to-the-trash"
  And the queue associated to "opinion_trash" producer has messages below:
  | 0 | {"opinionId": "opinion1"} |

@database
Scenario: Moderator wants to moderate an opinion via email link
  Given I go to "/moderate/opinion1ModerationToken/reason/moderation-guideline-violation"
  Then I should be redirected to "/projects/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/le-probleme-constate/opinion-1"
  And I should see "the-proposal-has-been-successfully-moved-to-the-trash"
  And I should see "in-the-trash"
  And the queue associated to "opinion_trash" producer has messages below:
  | 0 | {"opinionId": "opinion1"} |

@database
Scenario: Moderator wants to moderate and hide a version via email link
  Given I go to "/moderate/version1ModerationToken/reason/reporting.status.sexual"
  Then I should be redirected to "/projects/projet-de-loi-renseignement/trashed"
  And I should see "the-proposal-has-been-successfully-moved-to-the-trash"

@database
Scenario: Moderator wants to moderate a version via email link
  Given I go to "/moderate/version1ModerationToken/reason/moderation-guideline-violation"
  Then I should be redirected to "/projects/projet-de-loi-renseignement/consultation/elaboration-de-la-loi/opinions/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/article-1/versions/modification-1"
  And I should see "the-proposal-has-been-successfully-moved-to-the-trash"

@database
Scenario: Moderator wants to moderate and hide an argument via email link
  Given I go to "/moderate/argument1ModerationToken/reason/reporting.status.sexual"
  Then I should be redirected to "/projects/croissance-innovation-disruption/trashed"
  And I should see "the-argument-has-been-successfully-moved-to-the-trash"
  And the queue associated to "argument_trash" producer has messages below:
  | 0 | {"argumentId": "argument1"} |

@database
Scenario: Moderator wants to moderate an opinion via email link
  Given I go to "/moderate/argument1ModerationToken/reason/moderation-guideline-violation"
  Then I should be redirected to "/projects/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/les-causes/opinion-2#arg-argument1"
  And I should see "the-argument-has-been-successfully-moved-to-the-trash"
  And the queue associated to "argument_trash" producer has messages below:
  | 0 | {"argumentId": "argument1"} |
