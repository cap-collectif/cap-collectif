Feature: Login Api
  As an API client
  I want to be able to login
  So I can access the application

Scenario: Anonymous API client wants to login with correct credentials
  When I send a POST request to "/login_check" with json:
  """
  {
    "username": "user@test.com",
    "password": "user"
  }
  """
  Then the JSON response status code should be 200
  And the JSON response should match:
  """
  {"success":true}
  """

@security
Scenario: Anonymous API client wants to login with a wrong password
  When I send a POST request to "/login_check" with json:
  """
  {
    "username": "user@test.com",
    "password": "wronguserpass"
  }
  """
  Then the JSON response status code should be 401
  And the JSON response should match:
  """
  {"reason":"Bad credentials.","failedAttempts":"@integer@"}
  """
