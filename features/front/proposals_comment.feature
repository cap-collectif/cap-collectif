@proposal_comments
Feature: Proposal comments

@javascript @database
Scenario: User comment a proposal and admin should be notified if the proposal have comments notifications on
  Given I am logged in as user
  And I go to a proposal which is comment notifiable
  And I comment "Salut les filles"
  And I wait 3 seconds
  Then 1 mails should be sent
  And I should see mail with subject "Cap-Collectif — user a publié un commentaire sur une proposition"
  And I should see mail containing "Salut les filles"

@javascript @database
Scenario: User comment a proposal and admin should not be notified if the proposal have comments notifications off
  Given I am logged in as user
  And I go to a proposal which is not comment notifiable
  And I comment "Salut les filles"
  And I wait 3 seconds
  Then 0 mails should be sent

@javascript @database
Scenario: User update his comment and admin should be notified if the proposal have comments notifications on
  Given I am logged in as user
  And I go to a proposal which is comment notifiable
  And I comment "Salut les filles"
  And I wait 3 seconds
  And I click the edit comment button
  And I wait 3 seconds
  And I fill and submit the edit comment form with "Salut les filles, il faut que vous essayiez ce DOP à la madeleine"
  Then 2 mails should be sent
  And I should see mail with subject "Cap-Collectif — user a modifié un commentaire sur une proposition"
  And I should see mail containing "Salut les filles, il faut que vous essayiez ce DOP à la madeleine"

@javascript @database
Scenario: User update his comment and admin should not be notified if the proposal have comments notifications off
  Given I am logged in as user
  And I go to a proposal which is not comment notifiable
  And I comment "Salut les filles"
  And I wait 3 seconds
  And I click the edit comment button
  And I wait 3 seconds
  And I fill and submit the edit comment form with "Salut les filles, il faut que vous essayiez ce DOP à la madeleine"
  Then 0 mails should be sent

@javascript @database
Scenario: Anonymous user comment a proposal and admin should be notified if the proposal have comments notifications on
  Given I go to a proposal which is comment notifiable
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  And I wait 3 seconds
  Then 1 mails should be sent
  And I should see mail with subject "Cap-Collectif — Marie Lopez a publié un commentaire sur une proposition"
  And I should see mail containing "Salut les filles"

@javascript @database
Scenario: Anonymous user comment a proposal and admin should not be notified if the proposal have comments notifications off
  Given I go to a proposal which is not comment notifiable
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  And I wait 3 seconds
  Then 0 mails should be sent
