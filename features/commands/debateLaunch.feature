@debate @debate_launch
Feature: Notify Users of the launch of a debate

@parallel-scenario @snapshot-email
Scenario: "Dev want to notify users of the launch of a debate"
  Given I run "capco:debate:invite debateCannabis --test-token"
  Then the command exit code should be 0
  And 197 mail should be sent
  And I open mail with subject 'email-debate-launch-subject' from "assistance@cap-collectif.com" to "user@test.com"
  And I should see 'debate-mail-lancement' in mail
  Then email should match snapshot 'email_debate_launch.html'

@parallel-scenario @snapshot-email
Scenario: "Dev want to remind users of a debate"
  Given I run "capco:debate:invite debateCannabis -r --test-token"
  Then the command exit code should be 0
  And 198 mail should be sent
  And I open mail with subject 'email-debate-reminder-subject' from "assistance@cap-collectif.com" to "user@test.com"
  And I should see 'debate-mail-relance' in mail
  Then email should match snapshot 'email_debate_reminder.html'

@parallel-scenario @snapshot-email
Scenario: Dev want to notify users by pack of 100
  Given I run "capco:debate:invite debateOculusQuest --test-token --limit 100"
  Then the command exit code should be 0
  And 100 mail should be sent
  And I run "capco:debate:invite debateOculusQuest --test-token --limit 100"
  And the command exit code should be 0
  And 200 mail should be sent
  And I run "capco:debate:invite debateOculusQuest --test-token --limit 100"
  And the command exit code should be 0
  And 204 mail should be sent