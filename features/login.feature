Feature: Login

  Scenario: Login user
    Given I am logged in as user
    And I visited "home page"
    Then I should see "Bonjour user"

  Scenario: Login admin
    Given I am logged in as admin
    And I visited "home page"
    Then I should see "Bonjour admin"

  Scenario: Lost password
    Given I visited "login page"
    When I follow "Mot de passe oublié ?"
    And  I fill in "email" with "user@test.com"
    And I press "Réinitialiser le mot de passe"
    Then I should see "Si un compte est associé à l'adresse user@test.com, vous recevrez un e-mail avec un lien pour réinitialiser votre mot de passe."

  Scenario: Logout
    Given I am logged in as user
    And I visited "home page"
    When I follow "Bonjour user"
    And I follow "Déconnexion"
    Then I should see "Connexion"

  Scenario: Login as a previous drupal user
    Given I am logged in as drupal
    And I visited "home page"
    Then I should see "Bonjour drupal"
