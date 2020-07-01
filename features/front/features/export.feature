@export
Feature: Export url check

@database
Scenario: Logged in admin wants to export an event participant export
  Given I am logged in as admin
  Then I can download event participant export with eventId "event1" and eventSlug "event-with-registrations"

@database
Scenario: Logged in admin wants to export a project
  Given I am logged in as admin
  Then I can download "csv" export for project "croissance-innovation-disruption" and step "collecte-des-avis"
  Then I can download "xlsx" export for project "projet-avec-questionnaire" and step "questionnaire-des-jo-2024"
  Then I can download "csv" export for project "budget-participatif-rennes" and step "collecte-des-propositions"

@database
Scenario: Logged in admin wants to export a step participant export
  Given I am logged in as admin
  Then I can download participant "csv" export for step "selectionStepIdfVote" with slug "vote-des-franciliens"
  Then I can download participant "csv" export for step "U2VsZWN0aW9uU3RlcDpzZWxlY3Rpb25TdGVwSWRmVm90ZQ==" with slug "vote-des-franciliens"

@database
Scenario: Logged in admin wants to export a analysis and a decision exports
  Given I am logged in as admin
  Then I can download analysis export with project slug "project-analyse"
  Then I can download decision export with project slug "project-analyse"
