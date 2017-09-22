@ideas
Feature: Ideas

  Background:
    Given feature "ideas" is enabled

# Themes

  @javascript
  Scenario: Can see no ideas in empty theme
    Given feature "themes" is enabled
    When I go to an empty theme page
    Then I should see "Il n'y a aucune idée dans ce thème pour le moment. Soyez le premier à en proposer une !"
    Then there should be 0 ideas

  @javascript
  Scenario: Can see ideas in not empty theme
    Given feature "themes" is enabled
    When I go to a theme page
    Then I should not see "Il n'y a aucune idée dans ce thème pour le moment. Soyez le premier à en proposer une !"
    And there should be 3 ideas

# Homepage

  @javascript
  Scenario: User wants to see ideas on the homepage
    When I go to the homepage
    Then there should be 4 ideas
    And I should see "Voir toutes les idées"

# List

  @javascript
  Scenario: Anonymous user wants to see ideas and apply filters
    Given feature "themes" is enabled
    And I go to the ideas page
    Then there should be 10 ideas
    And I change the ideas theme filter
    Then there should be 1 ideas

  @javascript
  Scenario: Anonymous user wants to see ideas and sort them
    Given I go to the ideas page
    Then ideas should be ordered by date
    When I sort ideas by comments
    Then ideas should be ordered by comments

  @javascript
  Scenario: Anonymous user wants to see ideas and search by term
    Given I go to the ideas page
    Then there should be 10 ideas
    When I search for ideas with terms "dernière"
    Then there should be 1 ideas
    And ideas should be filtered by terms

# Create

  @database @javascript
  Scenario: Logged in user wants to create an idea
    Given feature "idea_creation" is enabled
    And I am logged in as user
    When I go to the ideas page
    When I click the idea create button
    And I fill the idea create form
    And I submit the new idea
    # Then I should see "Merci ! Votre idée a bien été enregistrée."
    And I should see my new idea

  @database @javascript
  Scenario: Logged in user wants to create an idea with a theme
    Given feature "idea_creation" is enabled
    And feature "themes" is enabled
    And I am logged in as user
    When I go to the ideas page
    And I click the idea create button
    And I fill the idea create form with a theme
    And I submit the new idea
    Then I should see "Merci ! Votre idée a bien été enregistrée."
    And I should see my new idea

  @javascript
  Scenario: Can not create an idea from ideas page when feature idea_creation is disabled
    Given I go to the ideas page
    Then I should not see the idea create button

  @javascript
  Scenario: Anonymous user wants to create an idea
    Given feature "idea_creation" is enabled
    When I go to the ideas page
    And I click the idea create button
    Then I should see "Vous devez être connecté pour réaliser cette action."

  @javascript
  Scenario: Logged in user wants to create an idea from a theme
    Given feature "themes" is enabled
    And feature "idea_creation" is enabled
    And I am logged in as user
    When I go to an empty theme page
    And I click the idea create button
    Then the theme should be selected in the idea form
    And I fill the idea create form with a theme
    And I submit the new idea

  @javascript
  Scenario: Anonymous user wants to create an idea from a theme
    Given feature "themes" is enabled
    And feature "idea_creation" is enabled
    When I go to an empty theme page
    And I click the idea create button
    Then I should see "Vous devez être connecté pour réaliser cette action."

  @javascript
  Scenario: Can not create an idea from theme when idea creation is disabled
    Given feature "themes" is enabled
    When I go to an empty theme page
    Then I should not see the idea create button

# Update

  @javascript @database
  Scenario: Author of an idea loose their votes when updating it
    Given I am logged in as user
    When I go to an idea with votes
    And I click the idea edit button
    And I edit my idea
    And I submit my edited idea
    Then my idea should have been modified
    And my idea should have lost its votes

  @javascript
  Scenario: Non author of an idea wants to update it
    Given I am logged in as admin
    When I go to an idea with votes
    Then I should not see the idea edit button

  @javascript
  Scenario: Author of an idea try to update without checking the confirm checkbox
    Given I am logged in as user
    When I go to an idea with votes
    And I click the idea edit button
    And I edit my idea without confirming my votes lost
    And I submit my edited idea
    Then I should see "Merci de confirmer la perte de vos votes pour continuer."

# Delete

  @javascript @database
  Scenario: Author of an idea wants to delete it
    Given I am logged in as user
    And I go to the ideas page
    And I go to an idea with votes
    When I delete my idea
    Then I should not see my idea anymore

  @javascript
  Scenario: Non author of an idea wants to delete it
    Given I am logged in as admin
    And I go to an idea with votes
    Then I should not see the idea delete button

# Reporting

  @javascript @database
  Scenario: Logged in user wants to report an idea
    Given feature "reporting" is enabled
    And I am logged in as admin
    And I go to an idea with votes
    When I click the idea report button
    And I fill the reporting form
    And I submit the reporting form
    Then I should see "Merci ! L'idée a bien été signalée."

  @javascript
  Scenario: Logged in user wants to report his own idea
    Given feature "reporting" is enabled
    And I am logged in as user
    When I go to an idea with votes
    Then I should not see the idea report button

# Sharing

  @javascript @database
  Scenario: Anonymous user wants to share an idea
    Given feature "share_buttons" is enabled
    And I go to an idea with votes
    When I click the share idea button
    Then I should see the share dropdown
    And I click the share link button
    Then I should see the share link modal

# Comments

  @javascript
  Scenario: Can not comment an uncommentable idea
    When I go to an idea not commentable
    Then I should not see "Commenter"

  ## Add a comment

  @database @javascript
  Scenario: Anonymous wants to comment an idea
    Given I visited "idea page" with:
      | slug | ideacommentable |
    And I wait 1 seconds
    And I fill in the following:
      | body        | J'ai un truc à dire de la part de Naruto |
    And I should see "Commenter avec mon compte"
    And I should see "Commenter sans créer de compte"
    And I fill in the following:
      | authorName  | Naruto              |
      | authorEmail | naruto72@gmail.com  |
    When I press "Commenter"
    And I wait 5 seconds
    Then I should see "J'ai un truc à dire de la part de Naruto" in the ".opinion__list" element

  @database @javascript
  Scenario: Logged in user wants to comment an idea
    Given I am logged in as user
    Given I visited "idea page" with:
      | slug | ideacommentable |
    And I wait 1 seconds
    And I fill in the following:
      | body        | J'ai un truc à dire avec mon compte |
    And I should not see "Commenter avec mon compte"
    And I should not see "Commenter sans créer de compte"
    When I press "Commenter"
    And I wait 5 seconds
    Then I should see "J'ai un truc à dire avec mon compte" in the ".opinion__list" element

  @database @javascript
  Scenario: Anonymous wants to comment an idea without email
    Given I visited "idea page" with:
      | slug | ideacommentable |
    And I wait 1 seconds
    And I fill in the following:
      | body        | J'ai un truc à dire mais pas le droit |
    And I fill in the following:
      | authorName  | Naruto              |
    When I press "Commenter"
    And I wait 2 seconds
    Then I should see "Cette valeur n'est pas une adresse email valide."
    And I should not see "J'ai un truc à dire mais pas le droit" in the ".opinion__list" element

## Comments vote

  @javascript @database
  Scenario: Logged in user wants to vote for a comment of an idea
    Given I am logged in as user
    And I visited "idea page" with:
      | slug | ideacommentable |
    And I wait 1 seconds
    And The first comment vote counter should be "0"
    When I vote for the first comment
    And I wait 1 seconds
    Then I should see "Merci ! Votre vote a bien été pris en compte."
    And I should see "Annuler mon vote"
    And The first comment vote counter should be "1"
    And I vote for the first comment
    And I wait 1 seconds
    And I should see "Votre vote a bien été supprimé."
    And The first comment vote counter should be "0"

# Votes

  @javascript @database
  Scenario: Logged in user wants to vote and unvote for an idea with a comment
    Given I am logged in as user
    And I go to an idea with votes
    And the idea has 2 votes
    When I add an idea vote comment
    And I submit the idea vote form
    And I should see "Merci ! Votre vote a bien été pris en compte."
    And I close current alert
    Then the idea should have 3 votes
    And I should see my comment in the idea comments list
    And I should see my vote in the idea votes list
    And I submit the idea vote form
    And I should see "Votre vote a bien été supprimé."
    Then the idea should have 2 votes
    And I should not see my vote in the idea votes list

  @javascript @database
  Scenario: Logged in user wants to vote for an idea anonymously
    Given I am logged in as user
    And I go to an idea with votes
    And the idea has 2 votes
    When I check the idea vote private checkbox
    And I submit the idea vote form
    Then the idea should have 3 votes
    And I should see my anonymous vote in the idea votes list
    And I should see "Merci ! Votre vote a bien été pris en compte."

  @javascript @database
  Scenario: Anonymous user wants to vote for an idea with a comment
    Given I go to an idea with votes
    And the idea has 2 votes
    And the idea has 0 comments
    When I fill the idea vote form
    And I add an idea vote comment
    And I submit the idea vote form
    Then the idea should have 3 votes
    And I should see my comment in the idea comments list
    And I should see my not logged in vote in the idea votes list
    And I should see "Merci ! Votre vote a bien été pris en compte."

  @javascript @database
  Scenario: Anonymous user wants to vote for an idea anonymously
    Given I go to an idea with votes
    And the idea has 2 votes
    When I fill the idea vote form
    And I check the idea vote private checkbox
    And I submit the idea vote form
    Then the idea should have 3 votes
    And I should see my anonymous vote in the idea votes list
    And I should see "Merci ! Votre vote a bien été pris en compte."

  @javascript @security
  Scenario: Anonymous user wants to vote twice with the same email
    Given I go to an idea with votes
    And the idea has 2 votes
    When I fill the idea vote form with already used email
    And I submit the idea vote form
    Then I should see "Vous avez déjà voté pour cette idée."
    And the idea should have 2 votes

  @javascript @security
  Scenario: Anonymous user wants to vote with an email already associated to an account
    Given I go to an idea with votes
    And the idea has 2 votes
    When I fill the idea vote form with a registered email
    And I submit the idea vote form
    Then I should see "Cette adresse électronique est déjà associée à un compte. Veuillez vous connecter pour soutenir cette idée."
    And the idea should have 2 votes

# Trash

  @javascript
  Scenario: Can not access trash if feature is disabled
    Given I am logged in as user
    And I go to the ideas page
    Then I should not see "Corbeille des idées"

  @javascript
  Scenario: Can not access trash if not logged in
    Given feature "idea_trash" is enabled
    And I go to the ideas page
    When I follow "Voir la corbeille"
    # Then I should see "Se connecter"

  @javascript
  Scenario: Ideas trash display correct number of elements
    Given feature "idea_trash" is enabled
    And I am logged in as user
    And I go to the ideas page
    And I click the ideas trash link
    Then there should be 12 ideas
