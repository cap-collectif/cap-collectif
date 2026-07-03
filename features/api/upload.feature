@upload
Feature: Upload

@security
Scenario: I send a request with stored XSS files
  When I send a "POST" request to "/api/files" with a stored XSS file
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {"errorCode": "An error occured while validating uploaded file."}
  """

@security
Scenario: I send a request with stored XSS files
  When I send a "POST" request to "/api/files" with a stored XSS HTML file
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {"errorCode": "An error occured while validating uploaded file."}
  """
