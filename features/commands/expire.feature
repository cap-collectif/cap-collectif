@expire
Feature: Expire Commands

@database
Scenario: Cron wants to expire users
    When I run "capco:expire-users"
    Then the command exit code should be 0
    And I should see "1 user(s) expired." in output
    And 1 mail should be sent
    And I open mail with subject "Cap-Collectif — Votre compte a expiré"
    And I should see "Confirmer mon adresse électronique et réactiver mon compte" in mail
    And I should see "/email-confirmation/qsdfghjklm" in mail
