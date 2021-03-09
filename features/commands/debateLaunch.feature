@debate @debate_launch
Feature: Notify Users of the launch of a debate

@parallel-scenario
Scenario: "Dev want to notify users of the launch of a debate"
  Given I run "capco:debate:invite debateCannabis"
  Then the command exit code should be 0
  And 224 mail should be sent
  And I open mail with subject 'email-debate-launch-subject' from "assistance@cap-collectif.com" to "user@test.com"
  And I should see ' avec Bob Marley et Laurent Alexandre.' in mail
  
@parallel-scenario
Scenario: "Dev want to remind users of a debate"
  Given I run "capco:debate:invite debateCannabis -r"
  Then the command exit code should be 0
  And 224 mail should be sent
  And I open mail with subject 'email-debate-reminder-subject' from "assistance@cap-collectif.com" to "user@test.com"
  And I should see ' avec Bob Marley et Laurent Alexandre et aussi 11 autres personnes.' in mail
