@consumers
Feature: User consumer

@database @rabbitmq
Scenario: Email should be sent to the user who change his password
  Given I publish in "user_password" with message below:
  """
  {
    "userId": "user515"
  }
  """
  And I consume "user_password"
  And I open mail with subject "email.notification.password.change.subject"
  Then email should match snapshot 'confirmPasswordChange.html'

@database @rabbitmq
Scenario: Email should be sent to the user who change his email
  Given I publish in "user_email" with message below:
  """
  {
    "userId": "user515"
  }
  """
  And I consume "user_email"
  And I open mail with subject "email.notification.email.change.subject"
  Then email should match snapshot 'confirmEmailChange.html'
