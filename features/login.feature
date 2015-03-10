Feature: Login

  Scenario: Login user
    Given I am logged in as user
    Then I should see "Bonjour user"

  Scenario: Login admin
    Given I am logged in as admin
    Then I should see "Bonjour admin"
