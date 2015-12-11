Feature: Ideas

Background:
  Given feature "ideas" is enabled

# Themes

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
  And I should see 3 ".media--macro" elements

Scenario: Can not create an idea from theme when idea creation is disabled
  Given feature "themes" is enabled
  And I visited "themes page"
  When I follow "Immobilier"
  Then I should not see "Proposer une idée"


# Homepage

Scenario: Can not create an idea from homepage when idea creation is disabled
  Given I visited "home page"
  Then I should not see "Proposer une idée"

# Create

Scenario: Can create an idea when logged in
  Given feature "themes" is enabled
  And feature "idea_creation" is enabled
  And I am logged in as user
  And I visited "ideas page"
  When I follow "Proposer une idée"
  And I fill in the following:
    | capco_appbundle_idea_title     | Titre                     |
    | capco_appbundle_idea_body      | Description de mon idée   |
    | capco_appbundle_idea_object    | Objectif de mon idée      |
  And I select "Immobilier" from "capco_appbundle_idea_theme"
  And I press "Publier"
  Then I should see "Merci ! Votre idée a bien été enregistrée."

Scenario: Can not create an idea from ideas page when feature idea_creation is disabled
  Given I visited "ideas page"
  Then I should not see "Proposer une idée"

Scenario: Can not create an idea when not logged in
  Given feature "idea_creation" is enabled
  And I visited "ideas page"
  When I follow "Proposer une idée"
  Then I should see "Se connecter"

# Update
Scenario: Author of an idea loose their votes when updating it
  Given I am logged in as user
  And I visited "ideas page"
  And I follow "Dernière idée"
  And I should see "1 vote" in the ".idea__votes-nb" element
  When I follow "Modifier"
  And I fill in the following:
    | capco_appbundle_ideaupdatetype_body      | Je modifie mon idée !   |
  And I check "capco_appbundle_ideaupdatetype_confirm"
  And I press "Modifier"
  Then I should see "Merci ! Votre idée a bien été modifiée."
  And I should not see "1 vote"

Scenario: Non author of an idea wants to update it
  Given I am logged in as admin
  And I visited "ideas page"
  And I follow "Dernière idée"
  Then I should not see "Modifier" in the ".pull-right" element

Scenario: Author of an idea try to update without checking the confirm checkbox
  Given I am logged in as user
  And I visited "ideas page"
  And I follow "Dernière idée"
  When I follow "Modifier"
  And I fill in the following:
    | capco_appbundle_ideaupdatetype_body      | Je modifie mon idée !   |
  And I press "Modifier"
  Then I should see "Merci de confirmer la perte de vos votes pour continuer."

# Comments

Scenario: Can not comment an uncommentable idea
  Given I visited "ideas page"
  And I follow "ideaNotCommentable"
  Then I should not see "Commenter"

  ## Add a comment

  @database @javascript
  Scenario: Anonymous wants to comment an idea
    Given I visited "ideas page"
    And I follow "ideaCommentable"
    And I wait 5 seconds
    And I fill in the following:
      | body        | J'ai un truc à dire |
    And I should see "Commenter avec mon compte"
    And I should see "Commenter sans créer de compte"
    And I fill in the following:
      | authorName  | Naruto              |
      | authorEmail | naruto72@gmail.com  |
    When I press "Commenter"
    And I wait 10 seconds
    Then I should see "J'ai un truc à dire" in the ".opinion__list" element

  @database @javascript
  Scenario: Logged in user wants to comment an idea
    Given I am logged in as user
    And I visited "ideas page"
    And I follow "ideaCommentable"
    And I wait 5 seconds
    And I fill in the following:
      | body        | J'ai un truc à dire |
    And I should not see "Commenter avec mon compte"
    And I should not see "Commenter sans créer de compte"
    When I press "Commenter"
    And I wait 5 seconds
    Then I should see "J'ai un truc à dire" in the ".opinion__list" element

  @database @javascript
  Scenario: Anonymous wants to comment an idea without email
    Given I visited "ideas page"
    And I follow "ideaCommentable"
    And I wait 5 seconds
    And I fill in the following:
      | body        | J'ai un truc à dire |
    And I fill in the following:
      | authorName  | Naruto              |
    When I press "Commenter"
    Then I should see "Cette valeur n'est pas une adresse email valide."
    And I should not see "J'ai un truc à dire" in the ".opinion__list" element

## Comments vote

  @javascript @database
  Scenario: Logged in user wants to vote for a comment of an idea
    Given I am logged in as user
    And I visited "idea page" with:
      | slug | ideacommentable |
    And I wait 5 seconds
    And The first comment vote counter should be "3"
    When I vote for the first comment
    And I wait 5 seconds
    Then I should see "Merci ! Votre vote a bien été pris en compte."
    And I should see "Annuler mon vote"
    And The first comment vote counter should be "4"
    And I vote for the first comment
    And I wait 5 seconds
    And I should see "Votre vote a bien été annulé."
    And The first comment vote counter should be "3"

# Votes

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
    When I follow "Soutenir avec mon compte"
    Then I should see "Se connecter"

  @database
  Scenario: Logged in user wants to vote
   Given I am logged in as user
   And I visited "idea page" with:
     | slug | ideacommentable |
   When I press "capco_app_idea_vote_submit"
   Then I should see "Merci ! Votre vote a bien été pris en compte."
   And I should see "user" in the "#ideaVotesModal" element

# Trash

  Scenario: Can not access trash if feature is disabled
    Given I visited "ideas page"
    Then I should not see "Corbeille des idées"

  Scenario: Can not access trash if not logged in
    Given feature "idea_trash" is enabled
    And I visited "ideas page"
    When I follow "Voir la corbeille"
    Then I should see "Se connecter"

  Scenario: Ideas trash display correct number of elements
    Given feature "idea_trash" is enabled
    And I am logged in as user
    And I visited "ideas page"
    When I follow "Voir la corbeille"
    Then I should see 11 ".media--macro" elements
