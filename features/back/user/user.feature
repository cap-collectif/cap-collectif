@admin @user
Feature: User Admin

Background:
  Given feature "profiles" is enabled

@database
Scenario: Logged in super admin wants to edit a user profile
  Given I am logged in as admin
  Then I go to the admin user page with userId "user516"
  And the "form.label_vip" checkbox should be checked
  And the "form.label_enabled" checkbox should be checked
  And the "form.label_locked" checkbox should not be checked
  And the "roles.user" checkbox should be checked
  And I should not see "roles.super_admin"
  And the button "user_admin_account_save" should be disabled
  And the "newsletter" checkbox should be checked
  Then I check "form.label_locked"
  And I wait 1 seconds
  And the button "user_admin_account_save" should not be disabled
  Then I click on button "#user_admin_account_save"
  And I wait 2 seconds
  And I should see "global.saved"

@database
Scenario: Logged in super admin wants to edit a user profile
  Given I am logged in as super admin
  Then I go to the admin user page with userId "user516"
  And I go to the admin user "profile" tab
  And I wait 2 seconds
  Then I should see "mauriau"
  And I fill the element "#public-data-form-neighborhood" with value "Sur ma chaise"
  And I fill the element "#public-data-form-biography" with value "Le terme “zèbre” a été introduit par Jeanne Siaud-Facchin dans son ouvrage Trop intelligent pour être heureux ? L'adulte surdoué. Il désigne aussi bien l'enfant surdoué que l'adulte surdoué. Extraits des pages 20 à 23 de l'ouvrage : "
  Then I click on button "#user-admin-profile-save"
  And I wait 2 seconds
  And I should see "global.saved"

@database
Scenario: Logged in super admin wants to edit a user data
  Given I am logged in as super admin
  Then I go to the admin user page with userId "user516"
  And I go to the admin user "data" tab
  And I wait 3 seconds
  When I fill the element "#city" with value "Issou"
  Then I click on button "#user-admin-personal-data-save"
  And I wait 2 seconds
  And I should see "global.saved"

@database
Scenario: Logged in super admin wants to edit a user password
  Given I am logged in as super admin
  Then I go to the admin user page with userId "user516"
  And I go to the admin user "password" tab
  And I wait 2 seconds
  Then I should see "user.profile.edit.password"
  And The element "#password-form-current" should be disabled
  And the button "user-admin-password-save" should be disabled

@database @randomly-failing
Scenario: Logged in admin wants to edit my password in back office
  Given I am logged in as admin
  Then I go to the admin user page with userId "userAdmin"
  And I go to the admin user "password" tab
  And I wait 2 seconds
  When I fill in the following:
    | current_password          | admin       |
    | new_password              | a      |
  Then I should see "at-least-8-characters-one-digit-one-uppercase-one-lowercase"
  Then I fill in the following:
    | new_password              | totoCapco2019 |
  And I wait 1 seconds
  Then I click on button "#user-admin-password-save"
  And I wait 2 seconds
  And I should see "global.saved"

@database
Scenario: Logged in super admin wants delete a user
  Given I am logged in as super admin
  Then I go to the admin user page with userId "user516"
  Then I click on button "#delete-account-profile-button"
  And I click the "#delete-account-hard" element
  And I wait "#confirm-delete-form-submit" to appear on current page
  When I click the "#confirm-delete-form-submit" element
  And I wait "#confirm-delete-form-submit" to disappear on current page
  Then I should be redirected to "/admin/capco/user/user/list"
  And I should see "deleted-user"

@database
Scenario: Logged in super admin wants to create a user
  Given I am logged in as super admin
  Then I go to the admin user list page
  And I wait 1 seconds
  And I open modal to create user
  Then I should see an ".modal-content" element
  And I should see "add-a-user"
  Then I fill in the following:
    | username | a                 |
    | email    | qsdqsdqsdsqdqsdqs |
  And I should see "registration.constraints.username.min"
  And I should see "global.constraints.email.invalid"
  Then I fill in the following:
    | username | Toto                  |
    | email    | blague.toto@gmail.com |
    | password | toto1234              |
  And I check "vip"
  And I check "roles.super_admin"
  And I check "roles.user"
  And I should not see "global.invalid.form"
  Then I click on button "#confirm-user-create"
  And I wait 1 seconds
  Then I should not see "global.invalid.form"
