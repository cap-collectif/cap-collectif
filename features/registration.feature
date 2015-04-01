Feature: Registration

  @database
  Scenario: Register new user with user type
    Given feature "registration" is enabled
    And feature "user_type" is enabled
    And I visited "home page"
    When I follow "Inscription"
    And I fill in the following:
    | sonata_user_registration_form_username             | Naruto42             |
    | sonata_user_registration_form_email                | naruto42@gmail.com   |
    | sonata_user_registration_form_plainPassword        | lol                  |
    And I select "Citoyen" from "sonata_user_registration_form_userType"
    And I check "sonata_user_registration_form_isTermsAccepted"
    And I press "S'inscrire"
    Then I should see "Merci ! Votre compte a bien été créé."

  @database
  Scenario: Register new user
    Given feature "registration" is enabled
    And I visited "home page"
    When I follow "Inscription"
    And I fill in the following:
      | sonata_user_registration_form_username             | Naruto42             |
      | sonata_user_registration_form_email                | naruto42@gmail.com   |
      | sonata_user_registration_form_plainPassword        | lol                  |
    And I check "sonata_user_registration_form_isTermsAccepted"
    And I press "S'inscrire"
    Then I should see "Merci ! Votre compte a bien été créé."
