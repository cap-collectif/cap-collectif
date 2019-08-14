@bp @proposal_page
Feature: Proposals page

@database
Scenario: Anonymous user should not see private fields on a proposal
  Given I go to a proposal
  Then I should not see the proposal private field

@database
Scenario: Non author should not see private fields on a proposal
  Given I am logged in as pierre
  When I go to a proposal
  Then I should not see the proposal private field

@database
Scenario: Logged in user should see private fields on his proposal
  Given I am logged in as user
  And I go to a proposal
  Then I should see the proposal private field

@database
Scenario: Admin should see private fields on a proposal
  Given I am logged in as admin
  And I go to a proposal
  Then I should see the proposal private field
