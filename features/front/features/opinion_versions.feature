@consultation @versions
Feature: Opinion Versions

@database
Scenario: Author of a version wants to delete it
  Given I am logged in as user
  And I go to a version
  When I click the delete version button
  And I confirm version deletion
  And I should not see my version anymore

@security
Scenario: Non author of a version wants to delete it
  Given I am logged in as admin
  And I go to a version
  Then I should not see the delete version button

@security
Scenario: Anonymous wants to delete a version
  Given I go to a version
  Then I should not see the delete version button

Scenario: Anonymous user wants to see all votes of a version
  Given I go to an opinion version with loads of votes
  When I click the show all opinion version votes button
  Then I should see all opinion version votes

@database
Scenario: Non author wants to report a version
  Given I am logged in as admin
  And feature "reporting" is enabled
  And I go to a version
  When I click the reporting opinion version button
  And I fill the reporting form
  And I submit the reporting form
  Then I should see "alert.success.report.opinion" in the "#global-alert-box" element
  And I should see "global.report.reported"
  And The element "#report-opinion-version1-button" should be disabled

@database
Scenario: Author of a version wants to edit it
  Given I am logged in as admin
  And I go to an editable version
  When I click the edit version button
  And I fill the edit version form
  And I check "confirm"
  And I click on button "[id='opinion-version-edit-update']"
  And I wait 2 seconds
  Then I should see "Updated title"
  Then I should see "Updated body"
  Then I should see "Updated comment"
