@changeArgument
Feature: Change Argument

## Update on opinion

@security
Scenario: Anonymous API client wants to update an argument on an opinion
  When I send a PUT request to "/api/opinions/opinion2/arguments/argument1" with a valid argument update json
  Then the JSON response status code should be 401

@security
Scenario: Logged in API client wants to update an argument on an opinion but is not the author
  Given I am logged in to api as admin
  When I send a PUT request to "/api/opinions/opinion2/arguments/argument1" with a valid argument update json
  Then the JSON response status code should be 403

@database @rabbitmq
Scenario: Logged in API client wants to update his argument on an opinion
  Given I am logged in to api as user
  When I send a PUT request to "/api/opinions/opinion2/arguments/argument1" with a valid argument update json
  Then the JSON response status code should be 200
  Then the queue associated to "argument_update" producer has messages below:
  | 0 | {"argumentId": "argument1"} |

## Update on version

@security
Scenario: Anonymous API client wants to update an argument on a version
  When I send a PUT request to "/api/opinions/opinion57/versions/version1/arguments/argument204" with a valid argument update json
  Then the JSON response status code should be 401

@security
Scenario: Logged in API client wants to update an argument on a version but is not the author
  Given I am logged in to api as admin
  When I send a PUT request to "/api/opinions/opinion57/versions/version1/arguments/argument204" with a valid argument update json
  Then the JSON response status code should be 403

@database @rabbitmq
Scenario: Logged in API client wants to update his argument on a version
  Given I am logged in to api as user
  When I send a PUT request to "/api/opinions/opinion57/versions/version1/arguments/argument204" with a valid argument update json
  Then the JSON response status code should be 200
  Then the queue associated to "argument_update" producer has messages below:
  | 0 | {"argumentId": "argument204"} |
