@consumers
Feature: User invite invitation consumer

@rabbitmq
Scenario: A user invitation is asynchronous
  Given I publish in "user_invite_invitation" with message below:
  """
  {
    "id": "remInvitation"
  }
  """
  And I consume 1 messages in "user_invite_invitation"
  And I open mail with subject "email-user-invitation-subject"
  Then email should match snapshot 'userInvitation.html'
