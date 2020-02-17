@sso @franceconnect
Feature: France Connect
##
## France connect has their own suite of test implemented here.
##
## See: https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service

Background:
  Given feature "login_franceconnect" is enabled

Scenario: Display France Connect login screen
  Given I open login modal
  When I follow "France Connect"
  Then I should see the France Connect login screen

Scenario: User can authentication via France Connect using a suitable identity provider
  Given I am on the France Connect authentication page of an identity provider with the appropriate level of eIDAS trust
  When I authenticate France Connect and validate
  Then I should be redirected to "/"
  And I can see I am logged in as "Angela Claire Louise DUBOIS"

## TODO in next PR:

# Scenario: Authenticated France Connect user can access his profile
#   Given I am authenticated via France Connect
#   When I visited "edit profile page"
#   Then I should see "Vous êtes identifié grâce à FranceConnect"
#   # Then I should see un lien "Qu'est-ce-que FranceConnect ?"
#   # Then I should see un lien "Historique des connexions/échanges de données"
#   # les champs sexe, nom, prénoms, date et lieu de naissance sont non modifiables. 
#   # les champs email, numéro de téléphone et adresse postale sont modifiables.

# Scenario: Logout a France Connect user
#   Given I am authenticated via France Connect
#   When I logout
#   Then I should see "global.login"
#   # Alors je dois être déconnecté de ma session FranceConnect ainsi que celle du fournisseur de service
#   # Je suis redirigé vers l'URL de callback de déconnexion du fournisseur de service

# Scenario: Authenticated France Connect user can dissociate his account
#   Given I am authenticated via France Connect
#   When I visited "edit profile page"
#   Then I should see "Vous êtes identifié grâce à FranceConnect"

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
