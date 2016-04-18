@registration
Feature: Registration

  @database @javascript
  Scenario: Anonymous wants to register with user type and zipcode
    Given features "registration", "user_type", "zipcode_at_register" are enabled
    And I visited "home page"
    When I press "Inscription"
    And I fill in the following:
    | _username             | Naruto42             |
    | _email                | naruto42@gmail.com   |
    | _password             | narutoisthebest      |
    | _zipcode              | 94123                |
    And I select "Citoyen" from "_user_type"
    And I check "_charte"
    And I press "S'inscrire"
    Then I wait 3 seconds
    Then I can see I am logged in as "Naruto42"

  @database @javascript
  Scenario: Anonymous wants to register
    Given feature "registration" is enabled
    And I visited "home page"
    When I press "Inscription"
    And I fill in the following:
      | _username             | Naruto42             |
      | _email                | naruto42@gmail.com   |
      | _password             | narutoisthebest      |
    And I check "_charte"
    And I press "S'inscrire"
    Then I wait 3 seconds
    Then I can see I am logged in as "Naruto42"

  @javascript @security
  Scenario: Anonymous wants to register with every possible errors
    Given features "registration", "user_type", "zipcode_at_register" are enabled
    And I visited "home page"
    When I press "Inscription"
    And I fill in the following:
    | _username             | p                    |
    | _email                | poupouil.com         |
    | _password             | 1234                 |
    | _zipcode              | 94                   |
    And I press "S'inscrire"
    Then I should see "Le nom doit faire au moins 2 caractères."
    And I should see "Cet email n'est pas valide."
    And I should see "Le mot de passe doit faire au moins 8 caractères."
    And I should see "Veuillez cocher la case pour accepter la charte."
