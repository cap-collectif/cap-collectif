@proposal_comments
Feature: Proposal comments

@javascript
Scenario: User comment a proposal and admin should be notified if the proposal is notifiable
  Given I am logged in as user
  And I go to a proposal which is comment notifiable
  And I comment "Salut les filles"
  And I wait 3 seconds
  Then 1 mails should be sent
  And I should see mail with subject "Cap-Collectif — user a publié un commentaire sur une proposition"
  And I should see mail containing "Salut les filles"

@javascript
Scenario: User comment a proposal and admin should not be notified if the proposal is not notifiable
  Given I am logged in as user
  And I go to a proposal which is not comment notifiable
  And I comment "Salut les filles"
  And I wait 3 seconds
  Then 0 mails should be sent

@javascript
Scenario: Anonymous user comment a proposal and admin should be notified if the proposal is notifiable
  Given I go to a proposal which is comment notifiable
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  And I wait 3 seconds
  Then 1 mails should be sent
  And I should see mail with subject "Cap-Collectif — Marie Lopez a publié un commentaire sur une proposition"
  And I should see mail containing "Salut les filles"

@javascript
Scenario: Anonymous user comment a proposal and admin should not be notified if the proposal is not notifiable
  Given I go to a proposal which is not comment notifiable
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  And I wait 3 seconds
  Then 0 mails should be sent
