@moderation
Feature: Moderation

@database
Scenario: Moderator wants to moderate via email link
  When I go to "/moderate/opinion1ModerationToken/reason/reporting.status.sexual"
  Then I should be redirected to "/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/opinion-1"
  And I should see "the-proposal-has-been-successfully-moved-to-the-trash"

@database
Scenario: Moderator wants to moderate via email link
    When I go to "/moderate/opinion1ModerationToken/reason/moderation-guideline-violation"
    Then I should be redirected to "/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/opinion-1"
    And I should see "the-proposal-has-been-successfully-moved-to-the-trash"
