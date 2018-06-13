@user_admin
Feature: User Admin

Background:
  Given feature "profiles" is enabled

@database
Scenario: Logged in admin wants edit a user account tab
  Given I am logged in as admin
  Then I go to the admin user page with userId "user516"
  And the "form.label_vip" checkbox should be checked
  And the "form.label_locked" checkbox should be checked
  And the "roles.user" checkbox should be checked
  And the "roles.super_admin" checkbox should be checked
  And the "newsletter" checkbox should be checked
  And I check "form.label_enabled"
  Then I click on button "#user_admin_account_save"
  And I wait 2 seconds
  And I should see "global.saved"

@database
Scenario: Logged in admin wants edit a user profile tab
  Given I am logged in as admin
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
Scenario: Logged in admin wants edit a user data tab
  Given I am logged in as admin
  Then I go to the admin user page with userId "user516"
  And I go to the admin user "data" tab
  And I wait 3 seconds
  When I fill the element "#city" with value "Issou"
  Then I click on button "#user-admin-persona-data-save"
  And I wait 2 seconds
  And I should see "global.saved"

@database
Scenario: Logged in admin wants edit a user password tab
  Given I am logged in as admin
  Then I go to the admin user page with userId "user516"
  And I go to the admin user "password" tab
  And I wait 2 seconds
  Then I should see "user.profile.edit.password"
  And The element "#password-form-current" should be disabled
  And the button "user-admin-password-save" should be disabled

@database
Scenario: Logged in admin wants edit my password in back office
  Given I am logged in as admin
  Then I go to the admin user page with userId "userAdmin"
  And I go to the admin user "password" tab
  And I wait 2 seconds
  When I fill in the following:
    | current_password          | admin       |
    | new_password              | 456465      |
    | new_password_confirmation | tatatatata  |
  Then I should see "fos_user.new_password.short"
  Then I fill in the following:
    | new_password              | tototototo |
    | new_password_confirmation | tatatatata |
  And I should see "fos_user.password.mismatch"
  Then I fill the element "#password-form-confirmation" with value "tototototo"
  And I wait 1 seconds
  Then I click on button "#user-admin-password-save"
  And I wait 6 seconds
  And I should see "global.saved"

@database
Scenario: Logged in admin wants delete a user
  Given I am logged in as admin
  Then I go to the admin user page with userId "user516"
  Then I click on button "#delete-account-profile-button"
  And I click the "#delete-account-hard" element
  When I click the "#confirm-delete-form-submit" element
  And I wait 5 seconds
  Then I should be redirected to "/admin/capco/user/user/list"
  And I should see "deleted-user"
