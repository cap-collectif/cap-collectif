@consumers
Feature: User archive consumer

@rabbitmq @export
Scenario: User request for personal archive is asynchronous
  Given I publish in "user_archive_request" with message below:
  """
  {
    "userArchiveId": "userArchive1"
  }
  """
  And I consume 1 messages in "user_archive_request"
  Then there should be a personal data archive for user "user1"
