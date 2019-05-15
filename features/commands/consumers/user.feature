@consumers
Feature: User consumer

@database @rabbitmq @snapshot
Scenario: Email should be sent to the user who change his password
  Given I publish in "user_password" with message below:
  """
  {
    "userId": "user5"
  }
  """
  And I consume "user_password"
  And I open mail with subject "email.notification.password.change.subject"
  Then email should match snapshot 'confirmPasswordChange.html'
