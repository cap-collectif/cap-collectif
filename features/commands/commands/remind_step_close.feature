Feature: Remind confirmation before step close command

Scenario: "should not send if no step ending"
  Given I run "capco:remind-user-account-confirmation-before-step-close --date '2031-09-28 22:05:00'"
  Then the command exit code should be 0
  And I should see "No step ending between 49 and 48h." in output
  And I should see "0 reminders sent !" in output

Scenario: "should not send if no unpublished contribution in ending step"
  Given I run "capco:remind-user-account-confirmation-before-step-close --date '2031-09-28 23:05:00'"
  Then the command exit code should be 0
  And I should see "Une entreprise doit-elle offrir un oculus quest 2 à tous les salariés pour le confinement ? will end at 2031-10-01 00:00:00" in output
  And I should see "3 unconfirmed users" in output
  And I should see "0 have unpublished contribution in ending step" in output
  And I should see "0 reminders sent !" in output

Scenario: "should send if unpublished contribution in ending step"
  Given I run "capco:remind-user-account-confirmation-before-step-close --date '2060-09-28 23:05:00'"
  Then the command exit code should be 0
  And I should see "Pour ou contre la légalisation du Cannabis ? will end at 2060-10-01 00:00:00" in output
  And I should see "send reminder to userNotConfirmedWithContributions@test.com" in output
  And I should see "send reminder to jeannine1957@laposte.fr" in output
  And I should see "2 reminders sent !" in output

Scenario: "should send if meeting minimal votes in ending step"
  Given I run "capco:remind-user-account-confirmation-before-step-close --date '2029-12-29 23:05:00'"
  Then the command exit code should be 0
  And I should see "Collecte avec vote classement limité will end at 2030-01-01 00:00:00" in output
  And I should see "send reminder to user_not_confirmed@test.com" in output
  And I should see "1 reminders sent !" in output