@consumers
Feature: User archive consumer

@rabbitmq @export @database
Scenario: User request for personal archive is asynchronous
  Given I publish in "user_archive_request" with message below:
  """
  {
    "userArchiveId": "userArchive1"
  }
  """
  And I consume 1 messages in "user_archive_request"
  Then personal data archive for user "user1" should match its snapshot

@rabbitmq @export @database
Scenario: User request for personal archive is asynchronous
  Given I publish in "user_archive_request" with message below:
  """
  {
    "userArchiveId": "userArchive3"
  }
  """
  And I consume 1 messages in "user_archive_request"
  Then personal data archive for user "user5" should match its snapshot
