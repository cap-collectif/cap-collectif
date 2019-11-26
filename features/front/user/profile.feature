@core @profile
Feature: Profil

Background:
  Given feature "profiles" is enabled

@database @randomly-failling
Scenario: Logged in user wants to change his username
  Given feature "user_type" is enabled
  Given I am logged in as user
  And I visited "edit profile page"
  And I wait "#account-tabs-pane-profile" to appear on current page
  And I fill in the following:
    | profile-form-username | user3 |
  And I wait 1 seconds
  And I press "profile-form-save"
  And I wait 1 seconds
  Then I should see "global.saved"

@database
Scenario: Logged in user wants to change his user type
  Given feature "user_type" is enabled
  And I am logged in as user
  And I visited "edit profile page"
  And I wait "#account-tabs-pane-profile" to appear on current page
  And I select "Organisation à but non lucratif" from "profile-form-userType"
  And I press "profile-form-save"
  And I wait 1 seconds
  Then I should see "global.saved"

@database
Scenario: Logged in user wants to change his password with a wrong current password
  Given I am logged in as user
  And I visited "change password page"
  And I wait 1 seconds
  And I fill in the following:
    | password-form-current      | toto         |
    | password-form-new          | tototototo   |
    | password-form-confirmation | tatatatata   |
  And I should see "fos_user.password.mismatch"
  And I should see "global.invalid.form"

@database
Scenario: Logged in user wants to change his password to a too short password
  Given I am logged in as user
  And I visited "change password page"
  And I wait 1 seconds
  And I fill in the following:
    | password-form-current      | user   |
    | password-form-new          | 1234   |
    | password-form-confirmation | 1234   |
  And I should see "at-least-8-characters-one-uppercase-one-lowercase"
  And I should see "global.invalid.form"

@database
Scenario: Logged in user wants to change his password
  Given I am logged in as user
  And I visited "change password page"
  And I wait 1 seconds
  And I fill in the following:
    | password-form-current      | user            |
    | password-form-new          | toto12345Toto   |
    | password-form-confirmation | toto12345Toto   |
  And I press "profile-password-save"
  And I wait 2 seconds
  And I should not see "fos_user.password.not_current"
  And I press "profile-password-save"
  # Because global.saved is automatically replaced by global.save we cannot use it as invariant
  # To check if password has really changed, this error should now occur
  And I should see "fos_user.password.not_current"
  And I fill in the following:
    | password-form-current      | toto12345Toto    |
    | password-form-new          | toto12345Toto2   |
    | password-form-confirmation | toto12345Toto2   |
  And I press "profile-password-save"
  And I wait 2 seconds
  # to check if the password matches the first new password given aka toto12345Toto
  And I should not see "fos_user.password.not_current"
  Then the queue associated to "user_password" producer has messages below:
    | 0 | {"userId": "user5"} |

@database
Scenario: Logged in user wants to manage his followings and unfollow all and stay unfollow after refresh
  Given I am logged in as user
  And I visited "manage followings page"
  And I wait 2 seconds
  And I click the "#unfollow-all" element
  Then I should see "no-following"
  Then I reload the page
  And I wait 2 seconds
  And I should see "no-following"

@database
Scenario: Logged in user wants to manage his followings and unfollow the first project and stay unfollow after refresh
  Given I am logged in as user
  And I visited "manage followings page"
  And I wait 2 seconds
  Then I click the "[id='profile-project-unfollow-button-UHJvamVjdDpwcm9qZWN0Ng==']" element
  And the "[id='profile-project-collapse-UHJvamVjdDpwcm9qZWN0Ng==']" element should not contain "class=\"capco-panel-list collapse in panel panel-default\""
  And I wait 2 seconds
  And I reload the page
  Then I should not see an "[id='profile-project-collapse-UHJvamVjdDpwcm9qZWN0Ng==']" element

@database
Scenario: Logged in user wants to manage his followings and unfollow the first proposal and stay unfollow after refresh
  Given I am logged in as user
  And I visited "manage followings page"
  And I wait 2 seconds
  Then I click the "#profile-proposal-unfollow-button-UHJvcG9zYWw6cHJvcG9zYWw4" element
  And the "span#collapse-proposal-UHJvcG9zYWw6cHJvcG9zYWw4" element should not contain "class=\"collapse in\""
  And I wait 2 seconds
  And I reload the page
  Then I should not see an "#profile-proposal-unfollow-button-UHJvcG9zYWw6cHJvcG9zYWw4" element

@database
Scenario: Logged in user wants to manage his followings and click on a proposal
  Given I am logged in as user
  And I visited "manage followings page"
  And I wait 2 seconds
  When I follow "Ravalement de la façade de la bibliothèque municipale"
  And I should be redirected to "/projects/budget-participatif-rennes/collect/collecte-des-propositions/proposals/ravalement-de-la-facade-de-la-bibliotheque-municipale"

@database
Scenario: Logged in user wants to manage his followings and click on a project
  Given I am logged in as user
  And I visited "manage followings page"
  And I wait 2 seconds
  When I click the "[id='profile-project-link-UHJvamVjdDpwcm9qZWN0Ng==']" element
  Then I should be redirected to "/project/budget-participatif-rennes/collect/collecte-des-propositions"

@database
Scenario: Logged in user wants to soft delete his account
  Given I am logged in as user
  And I visited "edit profile page"
  And I wait 2 seconds
  And I click the "#account-tabs-tab-account" element
  And I wait 1 seconds
  And I click the "#delete-account-profile-button" element
  When I click the "#confirm-delete-form-submit" element
  And I wait 5 seconds
  Then I should be redirected to "/"
  Then I should see "account-and-contents-anonymized" in the "#symfony-flash-messages" element

@database
Scenario: Logged as user, I want to delete my firstname, but I cancel it
  Given I am logged in as user
  And I visited "manage personal data page"
  And I wait 3 seconds
  And I should see "form.label_firstname"
  When I click the "#personal-data-firstname" element
  And I wait 1 seconds
  And I should see "are-you-sure-you-want-to-delete-this-field"
  Then I click on button "#btn-cancel-delete-field"
  And I should see "form.label_firstname"

@database
Scenario: Logged as user, I want to delete my firstname
  Given I am logged in as user
  And I visited "manage personal data page"
  And I wait 2 seconds
  And I should see "form.label_firstname"
  When I click the "#personal-data-firstname" element
  And I wait 1 seconds
  And I should see "are-you-sure-you-want-to-delete-this-field"
  Then I click on button "#btn-confirm-delete-field"
  And I should not see "form.label_firstname"

@database
Scenario: Logged as user, I want to update my firstname
  Given I am logged in as user
  And I visited "manage personal data page"
  And I wait 2 seconds
  And I should see "form.label_firstname"
  When I fill the element "#personal-data-form-firstname" with empty value
  Then I should see "fill-or-delete-field"
  And I wait 1 seconds
  And the button "personal-data-form-save" should be disabled
  And I should see "global.invalid.form"
  When I fill the element "#personal-data-form-firstname" with value "us"
  Then I should see "two-characters-minimum-required"
  And the button "personal-data-form-save" should be disabled
  And I should see "global.invalid.form"
  Then I fill the element "#personal-data-form-firstname" with value "myNewFirstname"
  And I should not see "global.invalid.form"
  And the button "personal-data-form-save" should not be disabled
  Then I click on button "#personal-data-form-save"
  And I wait 1 seconds
  And I should see "global.saved"
  Then I reload the page
  And I wait 2 seconds
  And the "firstname" field should contain "myNewFirstname"

@database
Scenario: Logged as user, I want to delete my address
  Given I am logged in as user
  And I visited "manage personal data page"
  And I wait "#personal-data" to appear on current page
  And I should see "form.label_address"
  And I should see "form.label_address2"
  And I should see "form.label_city"
  And I should see "form.label_zip_code"
  When I fill the element "#personal-data-form-address" with empty value
  Then I should see "fill-or-delete-field"
  And the button "personal-data-form-save" should be disabled
  Then I click the "#personal-data-address-address2-city-zipCode" element
  And I wait 1 seconds
  And I should see "are-you-sure-you-want-to-delete-this-field"
  Then I click on button "#btn-confirm-delete-field"
  And I should not see "form.label_address"
  And I should not see "form.label_address2"
  And I should not see "form.label_city"
  And I should not see "form.label_zip_code"
  And the button "personal-data-form-save" should not be disabled
  Then I click on button "#personal-data-form-save"
  And I wait 1 seconds
  And I should see "global.saved"
  Then I reload the page
  And I wait "#personal-data" to appear on current page
  And I should not see "form.label_address"
  And I should not see "form.label_address2"
  And I should not see "form.label_city"
  And I should not see "form.label_zip_code"

@database
Scenario: Logged as user, I want to update my profile
  Given feature "user_type" is enabled
  And I am logged in as user
  And I visited "edit profile page"
  And I wait "#profile-form-save" to appear on current page
  And I select "Organisation à but non lucratif" from "profile-form-userType"
  Then I fill the element "#public-data-form-biography" with value "I'm superman"
  And I press "profile-form-save"
  And I wait 1 seconds
  Then I should see "global.saved"

@database
Scenario: Logged as user, I want to update my profile
  Given feature "user_type" is disabled
  And I am logged in as user
  And I visited "edit profile page"
  And I wait "#main" to appear on current page
  And I should not see an "profile.form.userType" element
  And I wait "#profile-form-save" to appear on current page
  Then I fill the element "#public-data-form-biography" with value "I'm superman"
  And I press "profile-form-save"
  And I wait 1 seconds
  Then I should see "global.saved"

Scenario: Anonymous wants to see the profile of a user
  Given feature "user_type" is enabled
  And I go to a user profile
  Then I should see at least one opinion
  Then I should see at least one project
  Then I should see at least one version
  Then I should see at least one argument
  Then I should see at least one source
  Then I should see at least one proposal
  Then I should see at least one reply
  Then I should see at least one vote
