@contact
Feature: Contact

@javascript
Scenario: User wants to send a message via contact page
  Given I visited "contact page"
  When I fill in the following:
    | contact_name         | Mwa                                      |
    | contact_email        | rpz91300@msn.com                         |
    | contact_message      | Hello ! Votre site il est trop swag ! ^^ Pourquoi vous m'avez pas invité au hackaton :'( ? Je suis votre plus grand fan ! Maxime tu me reçois ? |
  And I press "Envoyer"
  Then I should see "Merci ! Votre message a bien été envoyé."

@javascript
Scenario: User wants to send a message via contact page with wrong email
  Given I visited "contact page"
  When I fill in the following:
    | contact_name         | Mwa                                      |
    | contact_email        | coucou je suis un imbécile               |
    | contact_message      | Hello ! Votre site il est trop swag ! ^^ |
  And I press "Envoyer"
  Then I should see "Cette valeur n'est pas une adresse email valide."

@javascript
Scenario: User wants to send a message via contact page without filling fields
  Given I visited "contact page"
  When I press "Envoyer"
  Then I should see "Veuillez renseigner votre nom pour continuer."
  And I should see "Veuillez renseigner votre adresse électronique pour continuer."
  And I should see "Oups, vous avez oublié de nous écrire un message !"
