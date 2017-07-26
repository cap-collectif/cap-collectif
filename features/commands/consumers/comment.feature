@consumers
Feature: Comment consumers

@rabbitmq
Scenario: Email should be sent to admin if a message is sent to the comment_create queue
  Given I publish in "comment_create" with message below:
  """
  {
    "commentId": "proposalComment1"
  }
  """
  And I consume "comment_create"
  Then I open mail with subject "notification.email.comment.create.subject"
  And I should see "notification.email.comment.create.body" in mail

@rabbitmq
Scenario: Email sent to admin should have correct subject and footer if comment author is anonymous when I consume comment create
  Given I publish in "comment_create" with message below:
  """
  {
    "commentId": "proposalComment6"
  }
  """
  And I consume "comment_create"
  Then I open mail with subject "notification.email.anonymous.comment.create.subject"
  And I should see "notification.email.anonymous.comment.create.body" in mail

@rabbitmq
Scenario: Email should be sent to admin if a message is sent to the comment_update queue
  Given I publish in "comment_update" with message below:
  """
  {
    "commentId": "proposalComment1"
  }
  """
  And I consume "comment_update"
  Then I open mail with subject "notification.email.comment.update.subject"
  And I should see "notification.email.comment.update.body" in mail

@rabbitmq
Scenario: Email sent to admin should have correct subject and footer if comment author is anonymous when I consume comment_update
  Given I publish in "comment_update" with message below:
  """
  {
    "commentId": "proposalComment6"
  }
  """
  And I consume "comment_update"
  Then I open mail with subject "notification.email.anonymous.comment.update.subject"
  And I should see "notification.email.anonymous.comment.update.body" in mail

@rabbitmq
Scenario: Email should be sent to admin if a message is sent to the comment_delete queue
  Given I publish in "comment_delete" with message below:
  """
  {
    "username": "Suzanne Favot",
    "notifying": true,
    "anonymous": false,
    "notifyTo": "admin",
    "userSlug": "sfavot",
    "body": "Expedita in et voluptatum repudiandae consequatur atque est. Deleniti delectus dicta omnis quis voluptate. Maiores qui nihil sit laboriosam accusantium.",
    "proposal": "Ravalement de la façade de la bibliothèque municipale",
    "projectSlug": "budget-participatif-rennes",
    "stepSlug": "collecte-des-propositions",
    "proposalSlug": "ravalement-de-la-facade-de-la-bibliotheque-municipale"
  }
  """
  And I consume "comment_delete"
  Then I open mail with subject "notification.email.comment.delete.subject"
  And I should see "notification.email.comment.delete.body" in mail

@rabbitmq
Scenario: Email sent to admin should have correct subject and footer if comment author is anonymous when I consume comment_delete
  Given I publish in "comment_delete" with message below:
  """
  {
    "username": "Suzanne Favot",
    "notifying": true,
    "anonymous": true,
    "notifyTo": "admin",
    "userSlug": null,
    "body": "Expedita in et voluptatum repudiandae consequatur atque est. Deleniti delectus dicta omnis quis voluptate. Maiores qui nihil sit laboriosam accusantium.",
    "proposal": "Ravalement de la façade de la bibliothèque municipale",
    "projectSlug": "budget-participatif-rennes",
    "stepSlug": "collecte-des-propositions",
    "proposalSlug": "ravalement-de-la-facade-de-la-bibliotheque-municipale"
  }
  """
  And I consume "comment_delete"
  Then I open mail with subject "notification.email.anonymous.comment.delete.subject"
  And I should see "notification.email.anonymous.comment.delete.body" in mail
