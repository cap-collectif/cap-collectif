Feature: Profile

  @javascript @database
  Scenario: Logged in user wants to change his username
    Given I am logged in as user
    And I visited "edit profile page"
    And I fill in the following:
      | sonata_user_profile_form_username | user3 |
    And I press "Enregistrer les modifications"
    Then I should see "Votre profil a été mis à jour"

  @javascript @database
  Scenario: Logged in user wants to change his user type
    Given feature "user_type" is enabled
    And I am logged in as user
    And I visited "edit profile page"
    And I select "Organisation à but non lucratif" from "sonata_user_profile_form_userType"
    And I press "Enregistrer les modifications"
    Then I should see "Votre profil a été mis à jour"

  @javascript @database
  Scenario: Logged in user wants to change his password with a wrong current password
    Given I am logged in as user
    And I visited "change password page"
    And I fill in the following:
      | fos_user_change_password_form_current_password | toto         |
      | fos_user_change_password_form_new_first        | tototototo   |
      | fos_user_change_password_form_new_second       | tatatatata   |
    And I press "Enregistrer les modifications"
    Then I should see "Ceci n'est pas votre mot de passe."
    And I should see "Les deux mots de passe ne sont pas identiques."

  @javascript @database
  Scenario: Logged in user wants to change his password to a too short password
    Given I am logged in as user
    And I visited "change password page"
    And I fill in the following:
      | fos_user_change_password_form_current_password | user |
      | fos_user_change_password_form_new_first        | 1234 |
      | fos_user_change_password_form_new_second       | 1234 |
    And I press "Enregistrer les modifications"
    And I should see "Le nouveau mot de passe est trop court."

  @javascript @database
  Scenario: Logged in user wants to change his password
    Given I am logged in as user
    And I visited "change password page"
    And I fill in the following:
      | fos_user_change_password_form_current_password | user        |
      | fos_user_change_password_form_new_first        | toto12345   |
      | fos_user_change_password_form_new_second       | toto12345   |
    And I press "Enregistrer les modifications"
    Then I should see "Votre mot de passe a bien été modifié."
