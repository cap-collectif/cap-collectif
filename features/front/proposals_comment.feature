@proposal_comments
Feature: Proposal comments

@javascript @database @dev
Scenario: User comment a proposal and admin should be notified if the proposal have comments notifications on
  Given I am logged in as user
  And I go to a proposal which is comment notifiable
  And I comment "Salut les filles"
  And I wait 3 seconds
  Then 1 mails should be sent
  And I open mail with subject 'notification.email.comment.create.subject'
  And I should see "notification.email.comment.create.body" in mail

@javascript @database @dev
Scenario: User comment a proposal and admin should not be notified if the proposal have comments notifications off
  Given I am logged in as user
  And I go to a proposal which is not comment notifiable
  And I comment "Salut les filles"
  And I wait 3 seconds
  Then 1 mails should be sent

@javascript @database @dev
Scenario: User update his comment and admin should be notified if the proposal have comments notifications on
  Given I am logged in as user
  And I go to a proposal which is comment notifiable
  And I comment "Salut les filles"
  And I wait 3 seconds
  And I click the edit comment button
  And I wait 3 seconds
  And I fill and submit the edit comment form with "Salut les filles, il faut que vous essayiez ce DOP à la madeleine"
  And I wait 3 seconds
  Then 2 mails should be sent
  And I open mail with subject 'notification.email.comment.update.subject'
  And I should see "notification.email.comment.update.body" in mail

@javascript @database @dev
Scenario: User update his comment and admin should not be notified if the proposal have comments notifications off
  Given I am logged in as user
  And I go to a proposal which is not comment notifiable
  And I comment "Salut les filles"
  And I wait 3 seconds
  And I click the edit comment button
  And I wait 3 seconds
  And I fill and submit the edit comment form with "Salut les filles, il faut que vous essayiez ce DOP à la madeleine"
  And I wait 3 seconds
  Then 1 mails should be sent

@javascript @database @dev
Scenario: Anonymous user comment a proposal and admin should be notified if the proposal have comments notifications on
  Given I go to a proposal which is comment notifiable
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  And I wait 3 seconds
  Then 1 mails should be sent
  And I open mail with subject 'notification.email.anonymous_comment.create.subject'
  And I should see "notification.email.anonymous_comment.create.body" in mail

@javascript @database @dev
Scenario: Anonymous user comment a proposal and admin should not be notified if the proposal have comments notifications off
  Given I go to a proposal which is not comment notifiable
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  And I wait 3 seconds
  Then 1 mails should be sent
