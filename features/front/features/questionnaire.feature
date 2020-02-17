@questionnaire
Feature: Questionnaire

## Questionnaire page
# Create
@database
Scenario: Logged in user wants to add a reply to a questionnaire
  Given I am logged in as user
  And I go to a questionnaire step
  Then I click on answer again
  Then I wait "#CreateReplyForm-responses0" to appear on current page
  When I fill the questionnaire form
  And I submit my reply
  And I wait "#global-alert-box .alert-success" to appear on current page
  Then I should see "reply.request.create.success" in the "#global-alert-box" element
  And I should see my 2 reply

@database
Scenario: Logged in user wants to add a private reply to a questionnaire
  Given I am logged in as user
  And I go to a questionnaire step
  Then I click on answer again
  And I fill the questionnaire form
  And I scroll to the bottom
  And I check the reply private checkbox
  And I submit my reply
  And I wait "#global-alert-box .alert-success" to appear on current page
  Then I should see "reply.request.create.success" in the "#global-alert-box" element
  And I should see my reply private 

@security
Scenario: Logged in user wants to add a reply to a questionnaire without filling the required questions
  Given I am logged in as user
  And I go to a questionnaire step
  Then I click on answer again
  Then I wait "#CreateReplyForm-responses0" to appear on current page
  When I fill the questionnaire form without the required questions
  And I submit my reply
  Then I should see "reply.constraints.field_mandatory" in the "#reply-form" element
  And I reload the page, I should see a confirm popup

@security
Scenario: Logged in user wants to add a reply to a questionnaire with not enough choices for required question
  Given I am logged in as user
  And I go to a questionnaire step
  Then I click on answer again
  When I fill the questionnaire form with not enough choices for required question
  And I submit my reply
  Then I should see 'reply.constraints.choices_equal {"nb":3}'
  And I reload the page, I should see a confirm popup

@security
Scenario: Logged in user wants to add a reply to a questionnaire with not enough choices for optional question
  Given I am logged in as user
  And I go to a questionnaire step
  Then I click on answer again
  When I fill the questionnaire form with not enough choices for optional question
  And I submit my reply
  Then I should see 'reply.constraints.choices_min {"nb":2}'
  And I reload the page, I should see a confirm popup

@database
Scenario: Logged in user wants to answer with a ranking
  Given I am logged in as user
  And I go to a questionnaire step
  Then I click on answer again
  When I click one ranking choice button pick
  Then the ranking choice should be in the choice box
  And I reload the page, I should see a confirm popup

@security
Scenario: Anonymous user wants to add a reply to a questionnaire
  Given I go to a questionnaire step
  Then I wait "#CreateReplyForm-responses0" to appear on current page
  Then I should see "reply.not_logged_in.error" in the "#main" element
  And the questionnaire form should be disabled

@security
Scenario: Logged in user wants to add a reply to a closed questionnaire step
  Given I am logged in as user
  When I go to a closed questionnaire step
  Then I should see "step.questionnaire.alert.ended.title" in the "#main" element
  And the questionnaire form should be disabled

@database
Scenario: Logged in user wants to add another reply when multiple replies is allowed
  Given I am logged in as admin
  When I go to a questionnaire step
  Then I click on answer again
  And I fill the questionnaire form
  And I submit my reply
  And I wait "#global-alert-box .alert-success" to appear on current page
  Then I should see "reply.request.create.success" in the "#global-alert-box" element
  And I should see my 4 reply

@security
Scenario: Logged in user wants to add another reply when multiple replies is not allowed
  Given I am logged in as admin
  When I go to a questionnaire step with no multiple replies allowed
  Then I wait ".userReplies" to appear on current page
  And I should only see my reply and not questionnaire

@database @draft
Scenario: Logged in user wants to add a draft to a questionnaire with wrong values
  Given I am logged in as user
  And I go to a questionnaire step
  Then I click on answer again
  Then I wait "#CreateReplyForm-responses0" to appear on current page
  When I fill the questionnaire form with wrong values
  And I submit my draft
  And I wait "#global-alert-box .alert-success" to appear on current page
  Then I should see "your-answer-has-been-saved-as-a-draft" in the "#global-alert-box" element
  And I should see my 2 reply

## Mail

@database
Scenario: Logged in API client can update his email
  Given I am logged in as user
  And I go to a questionnaire step
  Then I click on answer again
  When I fill the questionnaire form
  And I submit my reply
  And I wait "#global-alert-box .alert-success" to appear on current page
  Then I should see "reply.request.create.success" in the "#global-alert-box" element
  And I should see my 2 reply

## Replies list

Scenario: Logged in user wants to see the list of his replies
  Given I am logged in as admin
  When I go to a questionnaire step
  Then I should see my 3 reply

## Update
@database @rabbitmq
Scenario: Logged in user wants to update a reply
  Given I am logged in as admin
  When I go to a questionnaire step
  And I wait ".replyLink" to appear on current page
  Then I click on the reply button link
  And I wait "#create-reply-form" to appear on current page
  And I update the questionnaire form
  And I submit my updated reply
  And I wait "#global-alert-box .alert-success" to appear on current page
  Then I should see "reply.request.create.success" in the "#global-alert-box" element
  And I should see my 3 reply
  Then the queue associated to "questionnaire_reply" producer has messages below:
    | 0 | {"replyId": "reply2"} |

@database @draft
Scenario: Logged in user wants to update a draft to a questionnaire with wrong values
  Given I am logged in as admin
  And I go to a questionnaire step
  And I wait ".replyLink" to appear on current page
  Then I click on reply draft button link
  And I wait "#create-reply-form" to appear on current page
  Then I update the draft form without the required questions
  And I submit my updated draft
  And I wait "#global-alert-box .alert-success" to appear on current page
  Then I should see "your-answer-has-been-saved-as-a-draft" in the "#global-alert-box" element
  And I should see my 3 reply

## Deletion
@database @draft
Scenario: Logged in user wants to remove a reply
  Given I am logged in as admin
  When I go to a questionnaire step
  And I wait ".replyLink" to appear on current page
  And I click the delete reply button
  And I wait "#delete-reply-modal-UmVwbHk6cmVwbHky" to appear on current page
  And I confirm reply deletion
  And I wait "#global-alert-box .alert-success" to appear on current page
  Then I should see "reply.request.delete.success" in the "#global-alert-box" element
  And I wait "#delete-reply-modal-UmVwbHk6cmVwbHky" to disappear on current page
  And I click the delete reply draft button
  And I wait "#delete-reply-modal-UmVwbHk6cmVwbHk5" to appear on current page
  And I confirm reply draft deletion
  And I wait "#global-alert-box .alert-success" to appear on current page
  Then I should see "reply.request.delete.success" in the "#global-alert-box" element
  And I wait "#delete-reply-modal-UmVwbHk6cmVwbHk5" to disappear on current page
  And I click the delete 2nd reply draft button
  And I wait "#delete-reply-modal-UmVwbHk6cmVwbHk1" to appear on current page
  And I confirm 2nd reply draft deletion
  And I wait "#global-alert-box .alert-success" to appear on current page
  Then I should see "reply.request.delete.success" in the "#global-alert-box" element
  And I wait "delete-reply-modal-UmVwbHk6cmVwbHk1" to disappear on current page
  And I should not see my reply anymore

@security
Scenario: Logged in user wants to remove a reply in a closed questionnaire step
  Given I am logged in as admin
  When I go to a closed questionnaire step
  And I wait ".replyLink" to appear on current page
  Then I should not see the delete reply button
