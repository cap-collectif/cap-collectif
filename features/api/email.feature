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
    "message": "error.feature_not_enabled"
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

@database
Scenario: Not confirmed logged in API client can receive a new confirmation email
  Given feature "registration" is enabled
  And I am logged in to api as user_not_confirmed
  And I send a POST request to "/api/account/resend_confirmation_email"
  Then the JSON response status code should be 201
  And 1 mail should be sent
  And I open mail with subject 'email-subject-registration-confirmation {"{username}":"user_not_confirmed"}'
  Then I should see 'email-content-registration-confirmation {"{username}":"user_not_confirmed","{sitename}":"Cap-Collectif","{businessName}":"Cap Collectif","{profileUrl}":"https:\/\/capco.test\/profile\/usernotconfirmed","{confirmationUrl}":"https:\/\/capco.test\/account\/email_confirmation\/azertyuiop"}notification.email.external_footer {"{to}":"user_not_confirmed@test.com","{sitename}":"Cap-Collectif","{siteUrl}":"https:\/\/capco.test\/","{businessUrl}":"https:\/\/cap-collectif.com","{business}":"Cap Collectif"}' in mail

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

@database
Scenario: Logged in API client can update his email
  And I am logged in to api as user
  And I send a PUT request to "/api/users/me" with json:
  """
  {
    "email": "contact@spyl.net",
    "password": "user"
  }
  """
  Then the JSON response status code should be 204
  And I wait 2 seconds
  And 2 mail should be sent
  And I open mail with subject 'email.confirmNewEmail.subject'
  Then I should see "user.register.confirmation_message.validate" in mail
  Then I should see "/account/new_email_confirmation/" in mail
  And I open mail with subject 'email.confirmEmailChanged.subject {"%username%":"user"}'
  Then I should see "email-content-mail-changed" in mail

@security
Scenario: Logged in API client can't update his email, to an existing email
  And I am logged in to api as user
  And I send a PUT request to "/api/users/me" with json:
  """
  {
    "email": "user@test.com",
    "password": "user"
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "message": "Already used email."
  }
  """

@security
Scenario: Logged in API client can't update his email to a wrong email
  And I am logged in to api as user
  And I send a PUT request to "/api/users/me" with json:
  """
  {
    "email": "plop.com",
    "password": "user"
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "code": 400,
    "message": "Validation Failed",
    "errors": {
      "children": {
        "newEmailToConfirm": {
          "errors":["email.invalid {\"{{ value }}\":\"\\\"plop.com\\\"\"}","email.throwable"]
        }
      }
    }
  }
  """

@security
Scenario: Logged in API client can not update his email with a wrong password
  And I am logged in to api as user
  And I send a PUT request to "/api/users/me" with json:
  """
  {
    "email": "popopo@test.com",
    "password": "wrongpassword"
  }
  """
  Then the JSON response status code should be 400
  And the JSON response should match:
  """
  {
    "message": "You must specify your password to update your email."
  }
  """
