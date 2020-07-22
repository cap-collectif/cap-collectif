@admin @moderation @proposal_page_admin
Feature: Edit a proposal

#TODO do not have time to correctly fix this
@database @elasticsearch
Scenario: Logged in admin wants edit a proposal content
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  And I fill the proposal content address with "5 Allée Rallier du Baty, 35000 Rennes, France"
  And I fill in the following:
    | title | Proposition pas encore votable |
    | summary | "Un super résumé" |
    | proposal_body | "Look, just because I don't be givin' no man a foot massage don't make it right for Marsellus to throw Antwone into a glass motherfucking' house, fucking' up the way the nigger talks. Motherfucker do that shit to me, he better paralyze my ass, 'cause I'll kill the motherfucker, know what I'm sayin'?" |
    | responses[2].value  | HAHAHA |
  And I change the proposals "category" with option "Politique"
  And I attach the file "/var/www/features/files/image.jpg" to "proposal_media_field"
  And I attach the file "/var/www/features/files/document.pdf" to "proposal-admin-edit-responses3_field"
  And I wait 3 seconds
  Then I save current admin content proposal
  And I wait 2 seconds
  And I wait ".alert__form_succeeded-message" to appear on current page

@database @elasticsearch
Scenario: Logged in admin wants edit a proposal advancement tab
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  Then I go to the admin proposal advancement tab
  And I check element "selections[0].selected"
  And I wait "#proposal-admin-page-tabs-pane-2" to appear on current page
  And I change the proposal advancement select "proposal advancement selection status" with option "Soumis au vote"
  Then I save current proposal admin advancement
  And I wait ".alert__form_succeeded-message" to appear on current page

@database @elasticsearch
Scenario: Logged in admin wants to add some analyst groups
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  Then I go to the admin proposal evaluation tab
  And I fill "ag" and "Utilisateurs" to the analyst select
  And I save the current proposal evaluation analysts groupes
  And I wait ".alert__form_succeeded-message" to appear on current page

@database @elasticsearch
Scenario: Logged in admin wants to evaluate a proposal
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  Then I go to the admin proposal "evaluation" tab
  And I fill the proposal element "proposal evaluation evaluate" with value "Bonne"
  And I fill the proposal element "proposal evaluation evaluate more information" with value "C'est génial cette appli, les gens sont investit l'évaluation marche super bien !"
  And I evaluate the proposal presentation to "Au top"
  And I check element "proposal-admin-evaluation-responses3_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UyMw=="
  And I check element "proposal-admin-evaluation-responses4_choice-UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UyNg=="
  And I save the custom evaluation
  And I wait ".alert__form_succeeded-message" to appear on current page

@database @elasticsearch
Scenario: Logged in admin, wants to change the proposal's status
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  Then I go to the admin proposal status tab
  And I click on DRAFT status
  And I save the proposal's status
  And I wait ".alert__form_succeeded-message" to appear on current page

@database @elasticsearch
Scenario: Logged in admin, wants to delete a proposal and check if followers are not present
  Given I am logged in as super admin
  And I go to the admin proposal page with proposalid "proposal10"
  Then I go to the admin proposal status tab
  And I delete the proposal
  And I confirm the admin proposal deletion
  And I should see status DELETED
  Then I reload the page
  And I go to the admin proposal followers tab
  And I should not see an ".proposal__follower" element

@database @elasticsearch
Scenario: Logged in admin, wants to delete a proposal and re published it
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  Then I go to the admin proposal status tab
  And I delete the proposal
  And I confirm the admin proposal deletion
  And I should see status DELETED
  And I wait 2 seconds
  And I click on PUBLISHED status
  And I save the proposal's status
  And I wait ".alert__form_succeeded-message" to appear on current page

@database @elasticsearch
Scenario: Logged in admin, wants to view the proposal's followers
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  Then I go to the admin proposal followers tab
  And I should see 2 ".proposal__follower" elements

@database @elasticsearch
Scenario: Logged in admin, wants to download followers as CSV
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  Then I go to the admin proposal followers tab
  And I click on button "[id='proposal-follower-export-UHJvcG9zYWw6cHJvcG9zYWwxMA==']"
  And I follow "export_format_csv"

@database @elasticsearch
Scenario: Logged in admin, wants to download followers as xlsx
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  Then I go to the admin proposal followers tab
  And I click on button "[id='proposal-follower-export-UHJvcG9zYWw6cHJvcG9zYWwxMA==']"
  And I follow "project.download.modal.button"

@database @elasticsearch
Scenario: Logged in admin wants add a proposal realisation step
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  Then I go to the admin proposal advancement tab
  And I check element "selections[4].selected"
  And I wait "#proposal-admin-page-tabs-pane-2" to appear on current page
  And I click on button "[id='proposal-admin-progress-steps-add']"
  And I wait "#realisation-step-modal" to appear on current page
  And I fill in the following:
    | progressSteps[0].title    | Banque      |
  And I fill the date field
  And I click on button "#ProposalAdminRealisationStepModal-submit"
  And I wait "#realisation-step-modal" to disappear on current page
  And I click on button "#proposal_advancement_save"
  And I wait ".alert__form_succeeded-message" to appear on current page
