@proposal_evaluation
Feature: Proposals Evaluations

@javascript
Scenario: Logged in evaluer wants to see his evaluations
  Given I am logged in as user
  And I go to the evaluations page
  Then there should be 2 evaluations
