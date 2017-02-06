@expire
Feature: Expire Commands

@database
Scenario: Cron wants to expire users
    When I run "capco:expire-users"
    Then the command exit code should be 0
    And I should see "2 user(s) expired." in output
    And 2 mail should be sent
    And I open mail to "user_not_confirmed_to_be_expired@test.com"
    And I should see "Nous sommes au regret de vous annoncer que votre compte a expiré, car celui-ci n'a pas été vérifié dans un délai de 72 heures." in mail
    And I should see "Confirmer mon adresse électronique et réactiver mon compte" in mail
    And I should see "/email-confirmation/qsdfghjklm" in mail
    And I open mail to "user_not_confirmed_with_contributions_to_be_expired@test.com"
    And I should see "Nous sommes au regret de vous annoncer que votre compte a expiré et que vos contenus ont été dépubliés, car votre compte n'a pas été vérifié dans un délai de 72 heures." in mail
    And I should see "Confirmer mon adresse électronique et réactiver mon compte" in mail
    And I should see "/email-confirmation/oklmoklm" in mail

  @database
  Scenario: Cron wants to alert expired users
      Given I run "capco:expire-users"
      And I purge mails
      And I run "capco:alert-users-that-will-expire"
      Then the command exit code should be 0
      And I should see "1 user(s) alerted." in output
      And 1 mail should be sent
      And I open mail with subject "Cap-Collectif — Rappel : Vous n'avez pas encore confirmé votre adresse email"
      And I should see "Bonjour user_not_confirmed_to_be_expired_in_24_hours," in mail
      And I should see "Merci pour votre inscription sur Cap-Collectif." in mail
      And I should see "Veuillez cliquer sur le lien ci-dessous pour confirmer votre adresse électronique :" in mail
      And I should see "Confirmer mon adresse électronique" in mail
      And I should see "/email-confirmation/qsdfgsqdqsdsqdsqdhjkldsqdsqdsqdqsdm" in mail
      And I should see "Si vous avez des questions concernant votre compte ou tout autre sujet, n'hésitez pas à nous contacter à cette adresse dev@cap-collectif.com." in mail
      And I should see "Bien cordialement," in mail
