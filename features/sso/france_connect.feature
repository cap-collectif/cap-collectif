@sso @franceconnect
Feature: France Connect
##
## France connect has their own suite of test implemented here.
##
## See: https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service

Background:
  Given feature "login_franceconnect" is enabled
  Given I am logged in as super admin
  And I go to the admin shield configuration page
  And I enable toggle "toggle-franceConnect"
  And I go to "/"
  And I logout
  Then I should see "global.login"

Scenario: Display France Connect login screen
  Given I open login modal
  When I follow "FranceConnect"
  Then I should see the France Connect login screen

@database
Scenario: User can authentication via France Connect using a suitable identity provider
  Given I am on the France Connect authentication page of an identity provider with the appropriate level of eIDAS trust
  When I authenticate France Connect and validate
  Then I should be redirected to "/"
  And I can see I am logged in as "Angela Claire Louise"

@database
Scenario: Authenticated France Connect user can access his profile
  Given I am on the France Connect authentication page of an identity provider with the appropriate level of eIDAS trust
  When I authenticate France Connect and validate
  Then I should be redirected to "/"
  And I can see I am logged in as "Angela Claire Louise"
  When I visited "edit profile page"
  And I click the "#account-tabs-tab-account" element
  And I wait "fc-archive-connection" to appear on current page in "body"
  And The field "#account__email" should be enabled
  When I click the "#account-tabs-tab-personal-data" element
  And I wait "#personal-data-form-firstname" to appear on current page
  And The fields gender, lastname, firstname and birthdate, birthplace are not updatable
  And the "body" element should not contain "#personal-data-firstname"

@database
Scenario: Logout a France Connect user
  Given I am on the France Connect authentication page of an identity provider with the appropriate level of eIDAS trust
  When I authenticate France Connect and validate
  Then I should be redirected to "/"
  And I can see I am logged in as "Angela Claire Louise"
  When I logout
  Then I should see "global.login"
  Then I should be disconnected from FranceConnect

@database
Scenario: Authenticated France Connect user can dissociate his account
  Given I am on the France Connect authentication page of an identity provider with the appropriate level of eIDAS trust
  When I authenticate France Connect and validate
  Then I go to "/profile/edit-profile"
  And I click the "#account-tabs-tab-account" element
  And I dissociate from FranceConnect
  And I wait 5 seconds
  And I wait "#profile-account" to appear on current page
  Then I should be disconnected from FranceConnect

# Scenario: Authenticated France Connect user can not associate another account
# # Sachant que je possède un compte local et un compte FranceConnect auprès d'un fournisseur de service
# # Et que je suis connecté avec mon compte FranceConnect
# # Quand j'indique l'url https://app.franceconnect.gouv.fr/api/v1/authorize?response_type=code&client_id=<client_id>redirect_uri=<redirect_uri>&scope=<scope>&state=<state>&nonce=<nonce>
# # Alors je dois être redirigé vers la page d'édition de profil FranceConnect

# Scenario: Non France Connect user can associate his account
#   Given I am logged in as user
#   When I visited "edit profile page"
#   When I click button "certifier mon compte FranceConnect"
#   Then I should see the France Connect login screen
#   When I authenticate France Connect and validate
#   Then I should be redirected to "/edit-profile"
#   When I should not see "certifier mon compte FranceConnect"
#   When I should see "Dissocier mon compte de France Connect"
