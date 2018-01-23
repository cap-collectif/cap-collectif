@moderation
Feature: Moderation

@database @javascript
Scenario: Moderator wants to moderate and hide an opinion via email link
  Given I go to "/moderate/opinion1ModerationToken/reason/reporting.status.sexual"
  Then I should be redirected to "/projects/croissance-innovation-disruption/trashed"
  And I should see "the-proposal-has-been-successfully-moved-to-the-trash"

@database @javascript
Scenario: Moderator wants to moderate an opinion via email link
  Given I go to "/moderate/opinion1ModerationToken/reason/moderation-guideline-violation"
  Then I should be redirected to "/projects/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/le-probleme-constate/opinion-1"
  And I should see "the-proposal-has-been-successfully-moved-to-the-trash"
