@core @widget
Feature: Widget

# We should check that the header CSP allow iframes

Scenario: User wants to see an open debate widget
  Given I go to an open debate widget

Scenario: User try a random id to see a debate widget
  Given I go to "/widget_debate/123456"
  Then I should see "error.404.title"
