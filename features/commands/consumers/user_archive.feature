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
  Then I should see "user1.zip" file in "/var/www/web/export" directory
