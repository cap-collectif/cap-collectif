@core
Feature: Custom Pages

Scenario: Anonymous wants to see a custom page in french
  And I visited "custom page" with:
    | slug | faq |
  Then I should see "FAQ FR" in the "#jumbotron-title" element

Scenario: Anonymous wants to see a custom page in english
  And I visited "custom page" with:
    | slug | faq-en |
  Then I should see "FAQ EN" in the "#jumbotron-title" element
