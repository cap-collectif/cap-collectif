@proposals
Feature: Merge proposals

  @database @elasticsearch
  Scenario: Logged in admin wants to merge 2 proposals
    Given I am logged in as admin
    And I go to the admin proposals page
    When I click the create merge button
    And I fill the proposal merge form
    And I submit the create merge form
    Then I should not see "Publier"
