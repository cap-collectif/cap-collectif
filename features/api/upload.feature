@upload
Feature: Upload

@database
Scenario: I can send request with files attached to it
  When I send a "POST" request to "/api/files" with attached image file
  And the JSON response status code should be 201

@database
Scenario: I can send request with files attached to it
  When I send a "POST" request to "/api/files" with attached PDF file
  And the JSON response status code should be 201

@database
Scenario: I can send request with files attached to it
  When I send a "POST" request to "/api/files" with attached CSV COMMA file
  And the JSON response status code should be 201

@database
Scenario: I can send request with files attached to it
  When I send a "POST" request to "/api/files" with attached CSV SEMICOLON file
  And the JSON response status code should be 201

@security
Scenario: I send a request without files
  When I send a "POST" request to "/api/files" without attached file
  And the JSON response should match:
  """
  {"errorCode": "NO_MEDIA_FOUND"}
  """

@security
Scenario: I send a request with stored XSS files
  When I send a "POST" request to "/api/files" with a stored XSS file
  And the JSON response should match:
  """
  {"errorCode": "An error occured while validating uploaded file."}
  """

@security
Scenario: I send a request with stored XSS files
  When I send a "POST" request to "/api/files" with a stored XSS HTML file
  And the JSON response should match:
  """
  {"errorCode": "An error occured while validating uploaded file."}
  """