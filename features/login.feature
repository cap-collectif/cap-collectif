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
    And  I fill in "username" with "user@test.com"
    And I press "Réinitialiser le mot de passe"
    Then I should see "Un e-mail a été envoyé à l'adresse ...@test.com. Il contient un lien sur lequel il vous faudra cliquer afin de réinitialiser votre mot de passe."

  Scenario: Logout
    Given I am logged in as user
    And I visited "home page"
    When I follow "Bonjour user"
    And I follow "Déconnexion"
    Then I should see "Connexion"
