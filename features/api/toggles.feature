@toggles
Feature: Toggles

@security
Scenario: Anonymous API client wants to receive a confirmation sms
  When I send a PUT request to "/api/toggles/login_facebook" with json:
  """
  {
    "enabled": true
  }
  """
  Then the JSON response status code should be 403
  And the JSON response should match:
  """
  {"code":403,"message":"Not authorized."}
  """

@security
Scenario: Anonymous API client wants to receive a confirmation sms
  Given I am logged in to api as user
  When I send a PUT request to "/api/toggles/login_facebook" with json:
  """
  {
    "enabled": true
  }
  """
  Then the JSON response status code should be 403
  And the JSON response should match:
  """
  {"code":403,"message":"Not authorized."}
  """

@security
Scenario: Admin API client wants to update a non existing toggle
  Given I am logged in to api as admin
  When I send a PUT request to "/api/toggles/qsdoqshdoqsuhd" with json:
  """
  {
    "enabled": true
  }
  """
  Then the JSON response status code should be 404
  And the JSON response should match:
  """
  {
    "code":404,
    "message":"The feature \"qsdoqshdoqsuhd\" doesn't exists."
  }
  """

@database
Scenario: Admin API client wants to update a toggle
  Given I am logged in to api as admin
  And feature "login_facebook" is disabled
  When I send a PUT request to "/api/toggles/login_facebook" with json:
  """
  {
    "enabled": true
  }
  """
  Then the JSON response status code should be 204
  And feature "login_facebook" should be enabled
  When I send a PUT request to "/api/toggles/login_facebook" with json:
  """
  {
    "enabled": false
  }
  """
  Then the JSON response status code should be 204
  And feature "login_facebook" should be disabled
