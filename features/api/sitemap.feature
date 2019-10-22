@sitemap
Feature: Sitemap

Scenario: User wants visit sitemap
  Given features themes, blog, calendar are enabled
  When I send a GET request to xml "/sitemap.xml"
  Then the XML response status code should be 200
