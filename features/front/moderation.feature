@moderation
Feature: Moderation

Scenario: Moderator wants to moderate via email link
  When I go to "/moderate/opinion1/reason/reporting.status.sexual"
  Then I should be redirected to "/projects/{projectSlug}/consultation/{stepSlug}/opinions/{opinionTypeSlug}/opinion-1"
  And I should see "the-proposal-has-been-successfully-moved-to-the-trash"
