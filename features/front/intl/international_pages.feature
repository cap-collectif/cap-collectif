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
Scenario: User wants to go to the englxxxxish version of capco then do some admin stuff (non-translated urls have to exist)
  and keep language setting
  Given feature "unstable__multilangue" is enabled
  And I am logged in as admin
  And I go to "/en"
  And I go to "/admin"
  And I should be redirected to "/admin"
  And the locale should be "en-GB"
