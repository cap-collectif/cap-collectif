Feature: Ideas

Background:
  Given feature "ideas" is enabled

Scenario: Can see no ideas in empty theme
  Given feature "themes" is enabled
  And I visited "themes page"
  When I follow "Thème vide"
  Then I should see "Il n'y a aucune idée pour le moment."
  And I should see 0 ".media--macro" elements

Scenario: Can see ideas in not empty theme
  Given feature "themes" is enabled
  And I visited "themes page"
  When I follow "Immobilier"
  Then I should not see "Il n'y a aucune idée pour le moment."
  And I should see 2 ".media--macro" elements

Scenario: Can create an idea when logged in
  Given feature "themes" is enabled
  And I am logged in as user
  And I visited "ideas page"
  When I follow "Proposer une idée"
  And I fill in the following:
    | capco_appbundle_idea_title     | Titre                     |
    | capco_appbundle_idea_body      | Description de mon idée   |
    | capco_appbundle_idea_object    | Objectif de mon idée      |
  And I select "Immobilier" from "capco_appbundle_idea_Theme"
  And I press "Publier"
  Then I should see "Merci ! Votre idée a bien été enregistrée."

Scenario: Can not create an idea when not logged in
  Given I visited "ideas page"
  When I follow "Proposer une idée"
  Then I should see "Connexion"

Scenario: Can not comment an uncommentable idea
  Given I visited "ideas page"
  And I follow "ideaNotCommentable"
  Then I should not see "Commenter"

Scenario: Can comment an idea
  Given I visited "ideas page"
  And I follow "ideaCommentable"
  And I should see "Commenter avec mon compte"
  And I fill in the following:
    | capco_app_comment[authorName]  | Naruto              |
    | capco_app_comment[authorEmail] | naruto72@gmail.com  |
    | capco_app_comment[body]        | J'ai un truc à dire |
  When I press "Commenter"
  Then I should see "Merci ! Votre commentaire a bien été enregistré."
  And I should see "J'ai un truc à dire" in the ".opinion__list" element

  @javascript @database
  Scenario: Logged in user wants to vote for the comment of an idea
    Given I am logged in as user
    And I visited "idea page" with:
      | slug | ideacommentable |
    When I vote for the first comment
    Then The first comment vote counter should be "1"
    And I should see "Merci ! Votre vote a bien été pris en compte."
    And I should see "Annuler mon vote"
    And I vote for the first comment
    And I should see "Votre vote a bien été annulé."
    And The first comment vote counter should be "0"

 @database
 Scenario: Anonymous user wants to vote anonymously
  Given I visited "idea page" with:
    | slug | ideacommentable |
  When I fill in the following:
    | capco_app_idea_vote_username | Dupont           |
    | capco_app_idea_vote_email    | dupont@gmail.com |
  And I check "capco_app_idea_vote_private"
  And I press "capco_app_idea_vote_submit"
  Then I should see "Merci ! Votre vote a bien été pris en compte."
  And I should see "Anonyme" in the "#ideaVotesModal" element

  @database
  Scenario: Anonymous user wants to vote
   Given I visited "idea page" with:
     | slug | ideacommentable |
   When I fill in the following:
     | capco_app_idea_vote_username | Dupont           |
     | capco_app_idea_vote_email    | dupont@gmail.com |
   And I press "capco_app_idea_vote_submit"
   Then I should see "Merci ! Votre vote a bien été pris en compte."
   And I should see "Dupont" in the "#ideaVotesModal" element

  Scenario: Anonymous user wants to vote with his account
    Given I visited "idea page" with:
      | slug | ideacommentable |
    When I follow "M'inscrire avec mon compte"
    Then I should see "Se connecter"

  @database
  Scenario: Logged in user wants to vote
   Given I am logged in as user
   And I visited "idea page" with:
     | slug | ideacommentable |
   When I press "capco_app_idea_vote_submit"
   Then I should see "Merci ! Votre vote a bien été pris en compte."
   And I should see "user" in the "#ideaVotesModal" element

  @database
  Scenario: Logged in user wants to vote
    Given I am logged in as user
    And I visited "idea page" with:
      | slug | ideacommentable |
    When I press "capco_app_idea_vote_submit"
    Then I should see "Merci ! Votre vote a bien été pris en compte."
    And I should see "user" in the "#ideaVotesModal" element
