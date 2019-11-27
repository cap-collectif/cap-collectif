@bp @proposal_reporting
Feature: Proposals reporting

@database
Scenario: Logged in user wants to report a proposal
  Given feature "reporting" is enabled
  And I am logged in as admin
  And I go to a proposal
  When I click the report proposal button
  And I fill the reporting form
  And I submit the reporting form
  Then I should see "alert.success.proposition.reported" in the "#global-alert-box" element
