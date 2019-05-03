@core @contact
Feature: Contact

Scenario: User wants to send a message via the first form in contact page
  Given I visited "contact page"
  When I wait ".contact__form__list button:first-of-type" to appear on current page
  And I click the ".contact__form__list button:first-of-type" element
  And I fill in the following:
    | name         | Marie Lopez                                      |
    | title        | Proposition de partenariat avec Dop            |
    | email        | enjoyphoenix@gmail.com                         |
    | body         | Salut les filles, aujourd'hui je vous présente ce super shampooing à la madeleine ! |
  And I press "contact.submit"
  And I wait "#current-alert" to appear on current page
  Then I should see "contact.email.sent_success" in the "#current-alert" element

Scenario: User wants to send a message via the first form with wrong email in contact page
  Given I visited "contact page"
  When I wait ".contact__form__list" to appear on current page
  And I click the ".contact__form__list button:first-of-type" element
  And I fill in the following:
    | name         | Marie Lopez                                      |
    | title        | Proposition de partenariat avec Dop            |
    | email        | enjoyphoenix                      |
    | body         | Salut les filles, aujourd'hui je vous présente ce super shampooing à la madeleine ! |
  Then I should see "contact.form.error.email"

Scenario: User wants to send a message via the first form by filling empty fields in contact page
  Given I visited "contact page"
  When I wait ".contact__form__list" to appear on current page
  And I click the ".contact__form__list button:first-of-type" element
  And I fill in the following:
    | name         | |
    | title        | |
    | email        | |
    | body         | |
  Then I should see "contact.no_object"
  Then I should see "contact.no_email"
  Then I should see "contact.no_description"

@snapshot
Scenario: The email sent to the interlocutor should be sent
  Given I visited "contact page"
  When I wait ".contact__form__list button:first-of-type" to appear on current page
  And I click the ".contact__form__list button:first-of-type" element
  And I fill in the following:
    | name         | Marie Lopez                                      |
    | title        | Proposition de partenariat avec Dop            |
    | email        | enjoyphoenix@gmail.com                         |
    | body         | Salut les filles, aujourd'hui je vous présente ce super shampooing à la madeleine ! |
  And I press "contact.submit"
  And I wait "#current-alert" to appear on current page
  Then 1 mails should be sent
  And I open mail with subject 'via-the-contact-form-of {"{object}":"Proposition de partenariat avec Dop","{siteName}":"Cap-Collectif"}'
  Then email should match snapshot "contact.html.twig"
