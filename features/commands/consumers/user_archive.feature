@consumers
Feature: User archive consumer

@rabbitmq @export @snapshot
Scenario: User request for personal archive is asynchronous
  Given I publish in "user_archive_request" with message below:
  """
  {
    "userArchiveId": "userArchive1"
  }
  """
  And I consume 1 messages in "user_archive_request"
  Then there should be a personal data archive for user "user1"

@rabbitmq @export @snapshot
Scenario: User request for personal archive is asynchronous
  Given I publish in "user_archive_request" with message below:
  """
  {
    "userArchiveId": "userArchive3"
  }
  """
  And I consume 1 messages in "user_archive_request"
  Then there should be a personal data archive for user "user5"
