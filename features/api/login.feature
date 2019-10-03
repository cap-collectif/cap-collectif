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

@security @database
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
  {"reason":"Bad credentials.","failedAttempts":1}
  """

@security @database
Scenario: Anonymous API client wants to login with a wrong password 6 times in the same minute
  Given feature "restrict_connection" is enabled
  When I send a POST request to "/login_check" with json:
  """
  {
    "username": "user@test.com",
    "password": "wronguserpass1"
  }
  """
  And the JSON response should match:
  """
  {"reason":"Bad credentials.","failedAttempts":1}
  """
  When I send a POST request to "/login_check" with json:
  """
  {
    "username": "user@test.com",
    "password": "wronguserpass2"
  }
  """
  And the JSON response should match:
  """
  {"reason":"Bad credentials.","failedAttempts":2}
  """
  When I send a POST request to "/login_check" with json:
  """
  {
    "username": "user@test.com",
    "password": "wronguserpass3"
  }
  """
  And the JSON response should match:
  """
  {"reason":"Bad credentials.","failedAttempts":3}
  """
  When I send a POST request to "/login_check" with json:
  """
  {
    "username": "user@test.com",
    "password": "wronguserpass4"
  }
  """
  And the JSON response should match:
  """
  {"reason":"Bad credentials.","failedAttempts":4}
  """
  When I send a POST request to "/login_check" with json:
  """
  {
    "username": "user@test.com",
    "password": "wronguserpass5"
  }
  """
  And the JSON response should match:
  """
  {"reason":"Bad credentials.","failedAttempts":5}
  """
  When I send a POST request to "/login_check" with json:
  """
  {
    "username": "user@test.com",
    "password": "wronguserpass6"
  }
  """
  And the JSON response should match:
  """
  {"reason":"You must provide a captcha to login."}
  """
  When I send a POST request to "/login_check" with json:
  """
  {
    "username": "user@test.com",
    "password": "wronguserpass7",
    "captcha": "<fake-captcha-value>"
  }
  """
  Then the JSON response status code should be 401
  And the JSON response should match:
  """
  {"reason":"Invalid captcha."}
  """
