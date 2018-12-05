@core @rgpd
Feature: RGPD

@javascript
Scenario: An anonymous wants to simply accept cookies by clicking on accept button
  Given I visited "home page" with cookies not accepted
  And I should see "performance-cookies-alert"
  When I click on button "#cookie-consent"
  Then I should not see "performance-cookies-alert"

@javascript
Scenario: An anonymous wants to simply accept cookies by clicking anywhere
  Given I visited "home page" with cookies not accepted
  And I should see "performance-cookies-alert"
  When I click the "#main" element
  Then I should not see "performance-cookies-alert"

@javascript
Scenario: An anonymous wants to simply accept cookies by scrolling
  Given I go to a proposal with lot of comments
  And I should see "performance-cookies-alert"
  Then I scroll to the bottom
  And I scroll to the bottom
  Then I should not see "performance-cookies-alert"

@javascript
Scenario: An anonymous wants to show cookie page
  Given I visited "home page" with cookies not accepted
  And I should see "performance-cookies-alert"
  Then I follow "cookies-setting"
  And I should be redirected to "/confidentialite"
  When I click the "#main" element
  Then I should see "performance-cookies-alert"

@javascript
Scenario: An anonymous wants to toggle cookies performance
  Given I visited "confidentialite page" with cookies not accepted
  And I should not see "step.vote_type.disabled"
  Then I toggle performance cookies
  And I should see "step.vote_type.disabled"
  And I should not see "performance-cookies-alert"
  Then I go to a proposal with lot of comments
  And I visited "confidentialite page" with cookies not accepted
  And I should see "step.vote_type.disabled"
  And I should not see "performance-cookies-alert"

@javascript
Scenario: An anonymous wants to toggle cookies advertising
  Given I visited "confidentialite page" with cookies not accepted
  And I should not see "step.vote_type.disabled"
  Then I toggle advertising cookies
  And I should see "step.vote_type.disabled"
  And I should not see "performance-cookies-alert"
  Then I go to a proposal with lot of comments
  And I visited "confidentialite page" with cookies not accepted
  And I should see "step.vote_type.disabled"
  And I should not see "performance-cookies-alert"

@javascript
Scenario: An anonymous accept cookies then should have one created
  Given I visited "home page" with cookies not accepted
  And I should not see a cookie named "hasFullConsent"
  And I should see "performance-cookies-alert"
  Then I follow "cookies-setting"
  And I should be redirected to "/confidentialite"
  And I click on button "#cookie-consent"
  Then I should not see "performance-cookies-alert"
  Then I should see a cookie named "hasFullConsent"

@javascript
Scenario: An anonymous accept cookies then change is mind and the cookies should be deleted
  Given I am on the homepage
  And I should not see "performance-cookies-alert"
  And I should see a cookie named "hasFullConsent"
  And I create a cookie named "_pk_id.2733"
  And I visited "confidentialite page"
  And I toggle performance cookies
  Then I should not see a cookie named "_pk_id.2733"
