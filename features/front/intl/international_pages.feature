@international
Feature: Users can browse using translated URLs for each locale

@database
Scenario: User wants to go to the english version of capco
  Given feature "unstable__multilangue" is enabled
  And I go to "/en/projects"
  And I should be redirected to "/en/projects"
  And the locale should be "en-GB"

@database
Scenario: User wants to go to the english version of capco and keeps the language setting accross pages
  Given feature "unstable__multilangue" is enabled
  And I go to "/en"
  And I click on button "#tabs-navbar-link-11"
  And I should be redirected to "/en/projects"
  And I wait "#project-list" to appear on current page
  And the locale should be "en-GB"

@database
Scenario: User wants to go to the english version of capco then do some admin stuff
  and keep language setting
  Given feature "unstable__multilangue" is enabled
  And I am logged in as admin
  And I go to "/en"
  And I go to "/admin"
  And I should be redirected to "/admin"
  And the locale should be "en-GB"

@database
Scenario: User wants to go to the english version of capco but "unstable__multilangue" is not activated
  Given feature "unstable__multilangue" is disabled
  And I go to "/en/projects"
  And the locale should be "fr-FR"

@database
Scenario: User wants to go to the english version of capco with "unstable__multilangue" activated
  Given feature "unstable__multilangue" is enabled
  And I go to "/en/projects"
  And I should be redirected to "/en/projects"
  And the locale should be "en-GB"

@database
Scenario: User wants to go to the english version of capco with platform default set as "fr-FR"
  Given feature "unstable__multilangue" is enabled
  Given default locale is set to "fr-FR"
  And I go to "/"
  And the locale should be "fr-FR"
  And I click on button "#tabs-navbar-link-11"
  Then I should be redirected to "/projects"
  Given I go to "/en"
  Then I should be redirected to "/en"
  And the locale should be "en-GB"
  #We check that links are not redirecting to default ones
  Then I click on button "#tabs-navbar-link-11"
  Then I should be redirected to "/en/projects"

@database
Scenario: User wants to go to the english version of capco with platform default set as "en-GB"
  Given feature "unstable__multilangue" is enabled
  Given default locale is set to "en-GB"
  And I go to "/"
  And the locale should be "en-GB"
  And I click on button "#tabs-navbar-link-11"
  Then I should be redirected to "/projects"
  Given I go to "/en"
  Then I should be redirected to "/fr"
  And the locale should be "fr-FR"
  #We check that links are not redirecting to default ones
  Then I click on button "#tabs-navbar-link-11"
  Then I should be redirected to "/fr/projects"
