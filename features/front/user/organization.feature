@core @organization
Feature: Organization

@database
Scenario: Redirect to homepage if not connected
  When I go to "/invitation/organization/token2"
  Then I should be redirected to "/"
  And I should see "mauriau"

@database
Scenario: A wrong token should redirect to homepage
  Given I am logged in as user
  When I go to "/invitation/organization/token2"
  Then I should be redirected to "/"
  And I should see "invalid-token"

@database
Scenario: A good token should redirect to organization page
  Given I am logged in as mauriau
  When I go to "/invitation/organization/token2"
  Then I should be redirected to "/"