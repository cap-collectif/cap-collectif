@proposals
Feature: Edit a proposal

@database @elasticsearch
Scenario: Logged in admin wants edit a proposal content
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  And I fill in the following:
    | title | Proposition pas encore votable |
    | summary | "Un super résumé" |
    | proposal_address | Rennes, France |
    | proposal_body | "Look, just because I don't be givin' no man a foot massage don't make it right for Marsellus to throw Antwone into a glass motherfuckin' house, fuckin' up the way the nigger talks. Motherfucker do that shit to me, he better paralyze my ass, 'cause I'll kill the motherfucker, know what I'm sayin'?" |
    | responses[1]  | HAHAHA                                                                                                                                                                                                                                                                                                      |
  And I change the proposals Category
  And I attach the file "/var/www/features/files/image.jpg" to "proposal_media_field"
  And I attach the file "/var/www/features/files/document.pdf" to "responses[2]_field"
  And I wait 3 seconds
  Then I save current admin content proposal
  And I wait 3 seconds
  Then I should see "global.saved"

@database @elasticsearch
Scenario: Logged in admin wants edit a proposal advancement tab
  Given I am logged in as admin
  And I go to the admin proposal page with proposalid "proposal10"
  Then I go to the admin proposal advancement tab
  And I toggle a proposal advancement "proposal advancement selection"
  And I wait 3 seconds
  And I change the proposal advancement select "proposal advancement selection status" with option "Soumis au vote"
  Then I save current proposal admin advancement
  And I wait 3 seconds
  Then I should see "global.saved"
