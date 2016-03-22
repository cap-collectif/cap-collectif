@login
Feature: Login

  @javascript
  Scenario: A user wants to login
    Given I am logged in as user
    Then I should see "user" in the "#navbar-username" element

  @javascript
  Scenario: An admin wants to login
    Given I am logged in as admin
    Then I should see "admin" in the "#navbar-username" element

  @javascript
  Scenario: Lost password
    Given I open login modal
    When I follow "Mot de passe oublié ?"
    And  I fill in "email" with "user@test.com"
    And I press "Réinitialiser le mot de passe"
    Then I should see "Si un compte est associé à l'adresse user@test.com, vous recevrez un e-mail avec un lien pour réinitialiser votre mot de passe."

  @javascript
  Scenario: A logged user wants to logout
    Given I am logged in as user
    When I logout
    Then I should see "Connexion"

  @javascript
  Scenario: Login as a previous drupal user
    Given I am logged in as drupal
    Then I should see "drupal" in the "#navbar-username" element
