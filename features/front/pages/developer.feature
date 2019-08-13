@core @developer
Feature: Developer

Background:
  Given feature "developer_documentation" is enabled

Scenario: Anonymous wants to visit developer page
  Given I visited "developer page"
  Then I should see "Cap Collectif Developers"

Scenario: Anonymous wants to visit a category in developer page
  Given I visited "developer category page" with:
    | category | query |
  Then I should see "defines GraphQL operations that retrieve data from the server."

Scenario: Anonymous wants to visit a type in developer page
  Given I visited "developer category type page" with:
    | category | object |
    | type | Consultation |
  Then I should see "A consultation"

Scenario: Anonymous wants to visit an unknown type in developer page
  Given I visited "developer category type page" with:
    | category | object |
    | type | Unknown |
  Then I should see "error.404.title"

Scenario: Anonymous wants to visit guides developer page
  Given I visited "developer guides page"
  Then I should see "API Guides"

Scenario: Anonymous wants to visit a guide about questionnaires in developer page
  Given I visited "developer guide page" with:
    | guide | questionnaires |
  Then I should see "Look up responses to a questionnaire"

Scenario: Anonymous wants to visit an unknown guide in developer page
  Given I visited "developer guide page" with:
    | guide | Unknown |
  Then I should see "error.404.title"
