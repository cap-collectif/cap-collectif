Feature: Registration

  @database
  Scenario: Anonymous wants to register with user type
    Given feature "registration" is enabled
    And feature "user_type" is enabled
    And I visited "home page"
    When I follow "Inscription"
    And I fill in the following:
    | sonata_user_registration_form_username             | Naruto42             |
    | sonata_user_registration_form_email                | naruto42@gmail.com   |
    | sonata_user_registration_form_plainPassword        | narutoisthebest      |
    And I select "Citoyen" from "sonata_user_registration_form_userType"
    And I check "sonata_user_registration_form_isTermsAccepted"
    And I press "S'inscrire"
    Then I should see "Merci ! Votre compte a bien été créé."
    And I should see "Pour finaliser la création de votre compte, merci de cliquer sur le lien que nous venons de vous envoyer par e-mail à l'adresse naruto42@gmail.com."

  @database
  Scenario: Anonymous wants to register
    Given feature "registration" is enabled
    And I visited "home page"
    When I follow "Inscription"
    And I fill in the following:
      | sonata_user_registration_form_username             | Naruto42             |
      | sonata_user_registration_form_email                | naruto42@gmail.com   |
      | sonata_user_registration_form_plainPassword        | narutoisthebest      |
    And I check "sonata_user_registration_form_isTermsAccepted"
    And I press "S'inscrire"
    Then I should see "Merci ! Votre compte a bien été créé."
    And I should see "Pour finaliser la création de votre compte, merci de cliquer sur le lien que nous venons de vous envoyer par e-mail à l'adresse naruto42@gmail.com."

  Scenario: Anonymous wants to register with every possible errors
    Given feature "registration" is enabled
    And I visited "home page"
    When I follow "Inscription"
    And I fill in the following:
    | sonata_user_registration_form_username             | p                    |
    | sonata_user_registration_form_email                | poupouil.com         |
    | sonata_user_registration_form_plainPassword        | 1234                 |
    And I press "S'inscrire"
    Then I should see "Le nom doit faire au moins 2 caractères."
    And I should see "Ça ne semble pas être un email valide."
    And I should see "Le mot de passe doit faire au moins 8 caractères."
    And I should see "Veuillez cocher la case pour accepter la charte."
