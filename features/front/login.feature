@login
Feature: Login

  @javascript
  Scenario: A user wants to login and see he has successfully logged in.
    Given I am logged in as user
    Then I can see I am logged in as "user"

  @javascript
  Scenario: A drupal user wants to login and see he has successfully logged in.
    Given I am logged in as drupal
    Then I can see I am logged in as "drupal"

  @javascript
  Scenario: An admin wants to login and see he has successfully logged in.
    Given I am logged in as admin
    Then I can see I am logged in as "admin"
    And I can access admin in navbar

  @javascript
  Scenario: A logged user wants to logout
    Given I am logged in as user
    When I logout
    Then I should see "Connexion"

  @javascript
  Scenario: User has lost password
    Given I open login modal
    When I follow "Mot de passe oublié ?"
    And  I fill in "email" with "user@test.com"
    And I press "Réinitialiser le mot de passe"
    Then I should see "Si un compte est associé à l'adresse user@test.com, vous recevrez un e-mail avec un lien pour réinitialiser votre mot de passe."

  @javascript
  Scenario: Expired user can not login
    Given I want to login as expired_user
    Then I should see "Email ou mot de passe incorrect."
