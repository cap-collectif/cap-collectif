@sources
Feature: Sources

@security
Scenario: Anonymous API client wants to add a report
  When I send a POST request to "/api/opinions/opinion3/sources/source1/reports" with a valid report json
  Then the JSON response status code should be 403

@security
Scenario: Logged in API client wants to report his source
  Given I am logged in to api as user
  When I send a POST request to "/api/opinions/opinion3/sources/source1/reports" with a valid report json
  Then the JSON response status code should be 403

@database
Scenario: Logged in API client wants to report a source
  Given I am logged in to api as admin
  When I send a POST request to "/api/opinions/opinion3/sources/source1/reports" with a valid report json
  Then the JSON response status code should be 201

@security
Scenario: Anonymous API client wants to add a report
  When I send a POST request to "/api/opinions/opinion57/versions/version1/sources/source31/reports" with a valid report json
  Then the JSON response status code should be 403

@security
Scenario: Logged in API client wants to report his source
  Given I am logged in to api as user
  When I send a POST request to "/api/opinions/opinion57/versions/version1/sources/source31/reports" with a valid report json
  Then the JSON response status code should be 403

@database
Scenario: Logged in API client wants to report a source
  Given I am logged in to api as admin
  When I send a POST request to "/api/opinions/opinion57/versions/version1/sources/source31/reports" with a valid report json
  Then the JSON response status code should be 201
