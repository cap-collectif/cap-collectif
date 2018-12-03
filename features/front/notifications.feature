@core @notifications
Feature: Notifications

@javascript
Scenario: User with good unsubscribe token wants to connect via email link
  When I go to an email notifications preferences link with token "***REMOVED***"
  Then I should be redirected to "/profile/notifications"
  And I can see I am logged in as "user"

@javascript
Scenario: User with false unsubscribe token wants to connect via email link
  When I go to an email notifications preferences link with token "j35u15un70k3n7r4ff1qué"
  Then I should not be redirected to "/profile/notifications"

@javascript
Scenario: User wants to disable its notifications preferences via mail link
  When I go to an email disable notifications link with token "***REMOVED***"
  Then user with unsubscribe token "***REMOVED***" should have his notifications disabled
