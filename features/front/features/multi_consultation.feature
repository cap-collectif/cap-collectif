@consultation
Feature: Multi consultation

Scenario: User should be redirected to the consultation list page if the step has many consultations
  Given I go to "/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation"
  Then I should be redirected to "/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation/consultations"

Scenario: The back button in a consultation should redirect in the consultation list page when we are in a multi consultation step
  Given I go to "/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation/consultation/deuxieme-consultation"
  And I wait "#back-to-list-button" to appear on current page
  And I click the "#back-to-list-button" element
  Then I should be on "/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation/consultations"

Scenario: The consultation list page should correctly list the available consultations for a given step
  Given I go to "/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation/consultations"
  And I wait ".consultation__list" to appear on current page
  And I should see 2 ".consultation__preview" elements

Scenario: A user should be able to share the consultation when the feature is enabled
  Given feature "share_buttons" is enabled
  And I go to "/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation/consultation/deuxieme-consultation"
  And I wait "#share-button" to appear on current page
  And I click the "#share-button" element
  And I click the "#share-button + ul > li:last-of-type" element
  Then I should see "https://capco.test/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation/consultation/deuxieme-consultation"
