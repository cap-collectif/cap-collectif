@sms
Feature: Sms

@security
Scenario: Anonymous API client wants to receive a confirmation sms
  When I send a POST request to "/api/send-sms-confirmation"
  Then the JSON response status code should be 404
  And the JSON response should match:
  """
  {
    "code":404,
    "message": "error.feature_not_enabled"
  }
  """

@security
Scenario: Anonymous API client wants to receive a confirmation sms
  Given feature "phone_confirmation" is enabled
  When I send a POST request to "/api/send-sms-confirmation"
  Then the JSON response status code should be 403
  And the JSON response should match:
  """
  {
    "code": 403,
    "message": "Not authorized."
  }
  """

@security
Scenario: Logged in API client without phone wants to receive a new confirmation sms
  Given feature "phone_confirmation" is enabled
  And I am logged in to api as user_without_phone
  When I send a POST request to "/api/send-sms-confirmation"
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "No phone."
  }
  """

@security
Scenario: Logged in API client already sms confirmed wants to receive a new confirmation sms
  Given feature "phone_confirmation" is enabled
  And I am logged in to api as user
  When I send a POST request to "/api/send-sms-confirmation"
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Already confirmed."
  }
  """

# We stopped paying for Twilio, reenable when feature is needed
#
# @database
# Scenario: Logged in API client non-sms confirmed wants to receive a confirmation sms
#   Given feature "phone_confirmation" is enabled
#   And I am logged in to api as user_with_phone_not_phone_confirmed
#   When I send a POST request to "/api/send-sms-confirmation"
#   Then the JSON response status code should be 201
#   Then user_with_phone_not_phone_confirmed should have an sms code to confirm
#   When I send a POST request to "/api/send-sms-confirmation"
#   Then the JSON response status code should be 400
#   And the JSON response should match:
#   """
#   {
#     "code": 400,
#     "message": "sms_already_sent_recently",
#     "errors": null
#   }
#   """

@database
Scenario: Logged in API client non-sms confirmed with a wrong code wants to validate his phone
  Given feature "phone_confirmation" is enabled
  And I am logged in to api as user_with_code_not_phone_confirmed
  When I send a POST request to "/api/sms-confirmation" with json:
  """
  {
    "code": 123123
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "sms_code_invalid"
  }
  """

@database
Scenario: Logged in API client non-sms confirmed with a code wants to validate his phone
  Given feature "phone_confirmation" is enabled
  And I am logged in to api as user_with_code_not_phone_confirmed
  When I send a POST request to "/api/sms-confirmation" with json:
  """
  {
    "code": 123456
  }
  """
  Then the JSON response status code should be 201
  Then user_with_code_not_phone_confirmed should be sms confirmed

@security
Scenario: Logged in API client sms confirmed with a code wants to validate his phone
  Given feature "phone_confirmation" is enabled
  And I am logged in to api as user
  When I send a POST request to "/api/sms-confirmation" with json:
  """
  {
    "code": 123456
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Already confirmed."
  }
  """
