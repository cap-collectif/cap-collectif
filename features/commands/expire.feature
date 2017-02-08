@expire
Feature: Expire Commands

@database
Scenario: Cron wants to expire users
    When I run "capco:expire-users"
    Then the command exit code should be 0
    And I should see "2 user(s) expired." in output
    And 2 mail should be sent
    And I open mail to "user_not_confirmed_to_be_expired@test.com"
    And I should see "Nous sommes au regret de vous annoncer que votre compte a expiré, car celui-ci n'a pas été vérifié dans un délai de 12 heures." in mail
    And I should see "Confirmer mon adresse électronique et réactiver mon compte" in mail
    And I should see "/account/email_confirmation/qsdfghjklm" in mail
    And I open mail to "user_not_confirmed_with_contributions_to_be_expired@test.com"
    And I should see "Nous sommes au regret de vous annoncer que votre compte a expiré et que vos contenus ont été dépubliés, car votre compte n'a pas été vérifié dans un délai de 12 heures." in mail
    And I should see "Confirmer mon adresse électronique et réactiver mon compte" in mail
    And I should see "/account/email_confirmation/oklmoklm" in mail
