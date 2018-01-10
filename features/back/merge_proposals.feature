@proposals
Feature: Merge proposals

@database @elasticsearch
Scenario: Logged in admin wants to merge 2 proposals
  Given I am logged in as admin
  And I go to the admin proposals pages
  When I click the create merge button
  And I fill the proposal merge form
  And I submit the create merge form
  And I wait 2 seconds
  Then I should not see "Envoyer"
