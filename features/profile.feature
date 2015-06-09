Feature: Profile

  @database
  Scenario: Edit username
    Given I am logged in as user
    And I visited "profile page"
    And I follow "Édition"
    And I fill in the following:
      | sonata_user_profile_form_username | user3 |
    And I press "Enregistrer les modifications"
    Then I should see "Votre profil a été mis à jour"

  @database
  Scenario: Change user type
  Given feature "user_type" is enabled
  And I am logged in as user
  And I visited "profile page"
  And I follow "Édition"
  And I select "Organisation à but non lucratif" from "sonata_user_profile_form_userType"
  And I press "Enregistrer les modifications"
  Then I should see "Votre profil a été mis à jour"