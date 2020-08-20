@admin @menu @translation
  Feature: Menu links

@database
Scenario: Admin cannot access the LocaleAdmin without enabling multilangue
  Given I am logged in as admin
  And feature 'multilangue' is disabled
  And I go to the admin general list page
  Then I wait 'global-language' to disappear on current page in '.sidebar-menu'

@database
Scenario: Admin can access the LocaleAdmin after enabling multilangue
  Given feature 'multilangue' is enabled
  Then I wait 3 seconds
  And I go to the admin general list page
  Then I wait 'admin.group.parameters' to appear on current page in '.sidebar-menu'
  Then I wait 'global-languages' to appear on current page in '.sidebar-menu'
