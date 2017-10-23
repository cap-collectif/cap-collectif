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

@javascript @database
Scenario: Admin wants to set his password
  Given features "registration", "profiles" are enabled
  And I go to "/account/email_confirmation/check-my-email-token"
  Then I should be redirected to "/resetting/reset/check-my-email-token"
  When I fill in the following:
    | fos_user_resetting_form_new_first  | capcopopototo |
    | fos_user_resetting_form_new_second | capcopopototo |
  And I press "Confirmer"
  Then I should be redirected to "/"
  Then I can see I am logged in as "admin_without_password"
  And I should see "Votre mot de passe a bien été configuré"
