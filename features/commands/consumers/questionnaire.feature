@consumers
Feature: Questionnaire consummers

@rabbitmq @snapshot
Scenario: Email should be sent to admin if a user create a reply in a questionnaire
  Given I publish in "questionnaire_reply" with message below:
  """
  {
    "replyId": "reply1",
    "state": "create"
  }
  """
  And I consume "questionnaire_reply"
  Then I open mail with subject "email.notification.questionnaire.reply.subject.create"
  And email should match snapshot "notifyQuestionnaireReply_create.html.twig"
  Then I open mail with subject "reply.notify.user.create"
  And email should match snapshot "notifyUserQuestionnaireReply_create.html.twig"

@rabbitmq @snapshot
Scenario: Email should be sent to admin if a user update a reply in a questionnaire
  Given I publish in "questionnaire_reply" with message below:
  """
  {
    "replyId": "reply1",
    "state": "update"
  }
  """
  And I consume "questionnaire_reply"
  Then I open mail with subject "email.notification.questionnaire.reply.subject.update"
  And email should match snapshot "notifyQuestionnaireReply_update.html.twig"
  Then I open mail with subject "reply.notify.user.update"
  And email should match snapshot "notifyUserQuestionnaireReply_update.html.twig"

@rabbitmq @snapshot
Scenario: Email should be sent to admin if a user delete a reply in a questionnaire
  Given I publish in "questionnaire_reply" with message below:
  """
  {
    "reply": {
      "author_slug": "welcomattic",
      "deleted_at": "2019-04-24 11:40:34",
      "project_title": "Projet avec questionnaire",
      "questionnaire_step_title": "Questionnaire des JO 2024",
      "questionnaire_id": "questionnaire1",
      "author_name": "welcomattic"
    },
    "state": "delete"
  }
  """
  And I consume "questionnaire_reply"
  Then I open mail with subject "email.notification.questionnaire.reply.subject.delete"
  And email should match snapshot "notifyQuestionnaireReply_delete.html.twig"
