@deleteArgument
Feature: Delete an argument

## Delete from opinion

@security
Scenario: Anonymous API client wants to delete an argument from an opinion
  When I send a DELETE request to "/api/opinions/opinion2/arguments/argument1"
  Then the JSON response status code should be 401

@security
Scenario: Logged in API client wants to delete an argument from an opinion but is not the author
  Given I am logged in to api as admin
  When I send a DELETE request to "/api/opinions/opinion2/arguments/argument1"
  Then the JSON response status code should be 403

@database
Scenario: Logged in API client wants to delete his argument from an opinion
  Given I am logged in to api as user
  When I send a DELETE request to "/api/opinions/opinion2/arguments/argument1"
  Then the JSON response status code should be 204

## Delete from version

@security
Scenario: Anonymous API client wants to delete an argument from a version
  When I send a DELETE request to "/api/opinions/opinion57/versions/version1/arguments/argument204"
  Then the JSON response status code should be 401

@security
Scenario: Logged in API client wants to delete an argument from a version but is not the author
  Given I am logged in to api as admin
  When I send a DELETE request to "/api/opinions/opinion57/versions/version1/arguments/argument204"
  Then the JSON response status code should be 403

@database
Scenario: Logged in API client wants to delete his argument from a version
  Given I am logged in to api as user
  When I send a DELETE request to "/api/opinions/opinion57/versions/version1/arguments/argument204"
  Then the JSON response status code should be 204
