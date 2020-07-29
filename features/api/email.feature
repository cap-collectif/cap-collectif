@emails
Feature: Email

@security
Scenario: Registration is disabled and API client wants to resend an email
  When I send a POST request to "/api/account/resend_confirmation_email"
  Then the JSON response status code should be 404
  And the JSON response should match:
  """
  {
    "code":404,
    "message": "error.feature_not_enabled (registration)"
  }
  """

@security
Scenario: Anonymou API client wants resend an email
  Given feature "registration" is enabled
  When I send a POST request to "/api/account/resend_confirmation_email"
  Then the JSON response status code should be 403
  And the JSON response should match:
  """
  {
    "code": 403,
    "message": "Not authorized."
  }
  """

@security
Scenario: Confirmed and logged in API client wants resend an email
  Given feature "registration" is enabled
  And I am logged in to api as user
  When I send a POST request to "/api/account/resend_confirmation_email"
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Already confirmed."
  }
  """

@database
Scenario: Not confirmed logged in API client wants resend a confirmation email
  Given feature "registration" is enabled
  And I am logged in to api as user_not_confirmed
  When I send a POST request to "/api/account/resend_confirmation_email"
  Then the JSON response status code should be 201
  Then 1 mail should be sent
  And I purge mails
  When I send a POST request to "/api/account/resend_confirmation_email"
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Email already sent less than a minute ago."
  }
  """
  And 0 mail should be sent

@database @snapshot-email
Scenario: Not confirmed logged in API client can receive a new confirmation email
  Given feature "registration" is enabled
  And I am logged in to api as user_not_confirmed
  And I send a POST request to "/api/account/resend_confirmation_email"
  Then the JSON response status code should be 201
  And 1 mail should be sent
  And I open mail with subject 'email-subject-registration-confirmation {"{username}":"user_not_confirmed"}'
  Then email should match snapshot 'emailSubjectRegistrationConfirmation.html'

@database @security
Scenario: Not confirmed logged in API client wants to mass spam confirmation email
  Given feature "registration" is enabled
  And I am logged in to api as user_not_confirmed
  And I send a POST request to "/api/account/resend_confirmation_email"
  And 1 mail should be sent
  And I purge mails
  When I send a POST request to "/api/account/resend_confirmation_email"
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Email already sent less than a minute ago."
  }
  """
  And 0 mail should be sent
