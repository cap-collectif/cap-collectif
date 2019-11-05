@consumers @event
Feature: Event consumers

@rabbitmq @snapshot-email
Scenario: Email should be sent if a message is sent to the event_create queue
  Given I publish in "event_create" with message below:
  """
  {
    "eventId": "event5"
  }
  """
  And I consume "event_create"
  Then I open mail to 'dev@cap-collectif.com'
  And email should match snapshot "notifyAdminOfNewEvent.html"

@rabbitmq @snapshot-email
Scenario: Email should be sent if a message is sent to the event_update queue
  Given I publish in "event_update" with message below:
  """
  {
    "eventId": "event5"
  }
  """
  And I consume "event_update"
  Then I open mail to 'dev@cap-collectif.com'
  And email should match snapshot "notifyAdminOfEditedEvent.html"

@rabbitmq @snapshot-email
Scenario: Email should be sent if a message is sent to the event_delete queue
  Given I publish in "event_delete" with message below:
  """
  {
    "eventId": "event1",
    "eventParticipants": [
       {
          "email":"lbrunet@jolicode.com",
          "username":"lbrunet"
       },
       {
          "email":"user@test.com",
          "username":"test"
       },
       {
          "email":"",
          "username":"",
          "u_username":"registeredUser",
          "u_email":"toto@tata.fr"
       }
    ]
  }
  """
  And I consume "event_delete"
  Then I open mail to 'dev@cap-collectif.com'
  And email should match snapshot "notifyAdminOfDeletedEvent.html"
  Then I open mail to 'lbrunet@jolicode.com'
  And email should match snapshot "notifyParticipantOfDeletedEvent.html"
  Then I open mail to 'toto@tata.fr'
  And email should match snapshot "notifyRegisteredParticipantOfDeletedEvent.html"

@rabbitmq @snapshot-email
Scenario: Email should be sent if a message is sent to the event_review queue
  Given I publish in "event_review" with message below:
  """
  {
    "eventId": "eventCreateByAUserReviewApproved"
  }
  """
  And I consume "event_review"
  Then I open mail to 'user@test.com'
  And email should match snapshot "notifyUserReviewedEventApproved.html"

@rabbitmq @snapshot-email
Scenario: Email should be sent if a message is sent to the event_review queue
  Given I publish in "event_review" with message below:
  """
  {
    "eventId": "eventCreateByAUserReviewRefused"
  }
  """
  And I consume "event_review"
  Then I open mail to 'user@test.com'
  And email should match snapshot "notifyUserReviewedEventRefused.html"
