@rgpd
Feature: RGPD

@javascript
Scenario: An anonymous wants to simply accept cookies by clicking on accept button
  Given I visited "home page"
  And I should see "performance-cookies-alert"
  When I click on button "#cookie-consent"
  Then I should not see "performance-cookies-alert"

@javascript
Scenario: An anonymous wants to simply accept cookies by clicking anywhere
  Given I visited "home page"
  And I should see "performance-cookies-alert"
  When I click the "#main" element
  Then I should not see "performance-cookies-alert"

@javascript
Scenario: An anonymous wants to show cookie page
  Given I visited "home page"
  And I should see "performance-cookies-alert"
  Then I follow "cookies-setting"
  And I should be redirected to "/confidentialite"

@javascript
Scenario: An anonymous wants to toggle cookies performance
  Given I visited "confidentialite page"
  And I should not see "step.vote_type.disabled"
  Then I toggle performance cookies
  And I should see "step.vote_type.disabled"

@javascript
Scenario: An anonymous wants to toggle cookies advertising
  Given I visited "confidentialite page"
  And I should not see "step.vote_type.disabled"
  Then I toggle advertising cookies
  And I should see "step.vote_type.disabled"

Scenario: Visitor surf with Do Not Track activated
  Given I visited "cookies page"
