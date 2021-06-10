@upload
Feature: Upload

@database
Scenario: I can send request with files attached to it
  When I send a "POST" request to "/api/files" with attached file
  And the JSON response status code should be 201

@database
Scenario: I send a request without files
  When I send a "POST" request to "/api/files" without attached file
  And the JSON response should match:
  """
  {"errorCode": "NO_MEDIA_FOUND"}
  """