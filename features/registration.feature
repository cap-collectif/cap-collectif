Feature: Registration

  Scenario: Register new user
    Given feature "registration" is enabled
    And I visited "home page"
    When I follow "Connexion"
    And I follow "S'inscrire"
    And I fill in the following:
    | sonata_user_registration_form_username             | Naruto42             |
    | sonata_user_registration_form_email                | naruto42@gmail.com   |
    | sonata_user_registration_form_plainPassword_first  | lol                  |
    | sonata_user_registration_form_plainPassword_second | lol                  |
    And I check "sonata_user_registration_form_isTermsAccepted"
    And I press "S'inscrire"
    Then I should see "Merci ! Votre compte a bien été créé."
