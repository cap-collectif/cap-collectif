@core @login
Feature: Login

@database
Scenario: User has lost password
  Given I open login modal
  When I follow "global.forgot_password"
  And  I fill in "email" with "user@test.com"
  And I press "global.submit"
  Then I should see 'resetting-check-email {"email":"user@test.com"}'

@database
Scenario: User has lost password and email should be sent
  Given I open login modal
  When I follow "global.forgot_password"
  And  I fill in "email" with "user@test.com"
  And I press "global.submit"
  Then I should see 'resetting-check-email {"email":"user@test.com"}'
  And I open mail to "user@test.com"
  And I should see "email-content-resetting-password" in mail

@database @turnstile_challenge
Scenario: User fails to login many times (turnstile captcha gate)
  Given features "restrict_connection", "captcha", "turnstile_captcha" are enabled
  And I visited "home page"
  And I wait "#login-button" to appear on current page maximum 20
  When I press "global.login"
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | tot                     |
  When I press "global.login_me"
  Then I wait "#login-error" to appear on current page
  Then I should not see a "div[id^=turnstile_captcha-]" element
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | tot                     |
  When I press "global.login_me"
  Then I wait "#login-error" to appear on current page
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | tot                     |
  When I press "global.login_me"
  Then I wait "#login-error" to appear on current page
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | tot                     |
  When I press "global.login_me"
  Then I wait "#login-error" to appear on current page
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | tot                     |
  When I press "global.login_me"
  Then I wait "div[id^=turnstile_captcha-]" to appear on current page 1 times
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | toto                    |
  When I press "global.login_me"
  Then I should see "registration.constraints.captcha.invalid"

@database
Scenario: User fails to login many times (google captcha gate)
  Given features "restrict_connection", "captcha" are enabled
  Given I disable feature "turnstile_captcha"
  And I visited "home page"
  And I wait "#login-button" to appear on current page maximum 20
  When I press "global.login"
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | tot                     |
  When I press "global.login_me"
  Then I wait "#login-error" to appear on current page
  Then I should not see a "#recaptcha" element
  Then I should not see a "div[id^=turnstile_captcha-]" element
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | tot                     |
  When I press "global.login_me"
  Then I wait "#login-error" to appear on current page
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | tot                     |
  When I press "global.login_me"
  Then I wait "#login-error" to appear on current page
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | tot                     |
  When I press "global.login_me"
  Then I wait "#login-error" to appear on current page
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | tot                     |
  When I press "global.login_me"
  And I wait 3 seconds
  Then I should see a "#recaptcha" element
  Then I should not see a "div[id^=turnstile_captcha-]" element
  And I fill in the following:
    | username             | lbrunet@cap-collectif.com    |
    | password             | toto                    |
  When I press "global.login_me"
  Then I should see "registration.constraints.captcha.invalid"
