@consultation @versions
Feature: Opinion Versions

@javascript @database
Scenario: Author of a version wants to delete it
  Given I am logged in as user
  And I go to a version
  When I click the delete version button
  And I confirm version deletion
  And I should not see my version anymore

@javascript @security
Scenario: Non author of a version wants to delete it
  Given I am logged in as admin
  And I go to a version
  Then I should not see the delete version button

@javascript @security
Scenario: Anonymous wants to delete a version
  Given I go to a version
  Then I should not see the delete version button

@javascript
Scenario: Anonymous user wants to see all votes of a version
  Given I go to an opinion version with loads of votes
  When I click the show all opinion version votes button
  Then I should see all opinion version votes
