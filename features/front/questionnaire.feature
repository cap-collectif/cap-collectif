@questionnaire
Feature: Questionnaire

## Questionnaire page

# Create

@javascript @database
Scenario: Logged in user wants to add a reply to a questionnaire
  Given I am logged in as user
  And I go to a questionnaire step
  When I fill the questionnaire form
  And I submit my reply
  And I wait "#global-alert-box" to appear on current page
  Then I should see "reply.request.create.success" in the "#global-alert-box" element
  And I should see my reply

@javascript @database
Scenario: Logged in user wants to add a private reply to a questionnaire
  Given I am logged in as user
  And I go to a questionnaire step
  And I fill the questionnaire form
  And I check the reply private checkbox
  And I submit my reply
  And I wait "#global-alert-box" to appear on current page
  Then I should see "reply.request.create.success" in the "#global-alert-box" element
  And I should see my anonymous reply

@javascript @security
Scenario: Logged in user wants to add a reply to a questionnaire without filling the required questions
  Given I am logged in as user
  And I go to a questionnaire step
  When I fill the questionnaire form without the required questions
  Then I should see "reply.constraints.field_mandatory" in the "#reply-form" element

@javascript @security
Scenario: Logged in user wants to add a reply to a questionnaire with not enough choices for required question
  Given I am logged in as user
  And I go to a questionnaire step
  When I fill the questionnaire form with not enough choices for required question
  And I submit my reply
  Then I should see 'reply.constraints.choices_equal {"nb":3}'

@javascript @security
Scenario: Logged in user wants to add a reply to a questionnaire with not enough choices for optional question
  Given I am logged in as user
  And I go to a questionnaire step
  When I fill the questionnaire form with not enough choices for optional question
  And I submit my reply
  Then I should see 'reply.constraints.choices_min {"nb":2}'

@javascript @database
Scenario: Logged in user wants to answer with a ranking
  Given I am logged in as user
  And I go to a questionnaire step
  When I click one ranking choice right arrow
  Then the ranking choice should be in the choice box

@javascript @security
Scenario: Anonymous user wants to add a reply to a questionnaire
  Given I go to a questionnaire step
  Then I should see "reply.not_logged_in.error" in the "#main" element
  And the questionnaire form should be disabled

@javascript @security
Scenario: Logged in user wants to add a reply to a closed questionnaire step
  Given I am logged in as user
  When I go to a closed questionnaire step
  Then I should see "step.questionnaire.alert.ended.title" in the "#main" element
  And the questionnaire form should be disabled

@javascript @database
Scenario: Logged in user wants to add another reply when multiple replies is allowed
  Given I am logged in as admin
  When I go to a questionnaire step
  And I fill the questionnaire form
  And I submit my reply
  Then I should see "reply.request.create.success" in the "#global-alert-box" element
  And I should see my reply

@javascript @security
Scenario: Logged in user wants to add another reply when multiple replies is not allowed
  Given I am logged in as admin
  When I go to a questionnaire step with no multiple replies allowed
  Then I should see "reply.user_has_reply.reason" in the "#main" element
  And the questionnaire form should be disabled

## Replies list

@javascript
Scenario: Logged in user wants to see the list of his replies
  Given I am logged in as admin
  When I go to a questionnaire step
  Then I should see my reply

@javascript
Scenario: Logged in user wants to see his reply
  Given I am logged in as admin
  When I go to a questionnaire step
  And I click on my first reply
  Then I should see my first reply

## Deletion

@javascript @database
Scenario: Logged in user wants to remove a reply
  Given I am logged in as admin
  When I go to a questionnaire step
  And I click on my first reply
  And I click the delete reply button
  And I confirm reply deletion
  Then I should see "reply.request.delete.success" in the "#global-alert-box" element
  And I should not see my reply anymore

@javascript @security
Scenario: Logged in user wants to remove a reply in a closed questionnaire step
  Given I am logged in as admin
  When I go to a closed questionnaire step
  And I click on my first reply
  Then I should not see the delete reply button
