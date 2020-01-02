@arguments
Feature: Arguments

# Report from opinion

@database
Scenario: Anonymous API client wants to report an argument from an opinion
  When I send a POST request to "/api/opinions/T3BpbmlvbjpvcGluaW9uMg==/arguments/QXJndW1lbnQ6YXJndW1lbnQx/reports" with a valid report json
  Then the JSON response status code should be 403

@database
Scenario: Logged in API client wants to report his own argument from an opinion
  Given I am logged in to api as user
  When I send a POST request to "/api/opinions/T3BpbmlvbjpvcGluaW9uMg==/arguments/QXJndW1lbnQ6YXJndW1lbnQx/reports" with a valid report json
  Then the JSON response status code should be 403

@database
Scenario: Logged in API client wants to report an argument from an opinion
  Given I am logged in to api as admin
  When I send a POST request to "/api/opinions/T3BpbmlvbjpvcGluaW9uMg==/arguments/QXJndW1lbnQ6YXJndW1lbnQx/reports" with a valid report json
  Then the JSON response status code should be 201

# Report from a version

@database
Scenario: Anonymous API client wants to report an argument from a version
  When I send a POST request to "/api/opinions/T3BpbmlvbjpvcGluaW9uNTc=/versions/version1/arguments/QXJndW1lbnQ6YXJndW1lbnQyMDQ=/reports" with a valid report json
  Then the JSON response status code should be 403

@database
Scenario: Logged in API client wants to report his own argument from a version
  Given I am logged in to api as user
  When I send a POST request to "/api/opinions/T3BpbmlvbjpvcGluaW9uNTc=/versions/version1/arguments/QXJndW1lbnQ6YXJndW1lbnQyMDQ=/reports" with a valid report json
  Then the JSON response status code should be 403

@database
Scenario: Logged in API client wants to report an argument from a version
  Given I am logged in to api as admin
  When I send a POST request to "/api/opinions/T3BpbmlvbjpvcGluaW9uNTc=/versions/version1/arguments/QXJndW1lbnQ6YXJndW1lbnQyMDQ=/reports" with a valid report json
  Then the JSON response status code should be 201
