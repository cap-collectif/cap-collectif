@bp @proposal_sharing
Feature: Proposals sharing

@database
Scenario: Anonymous user wants to share a proposal
  Given feature "share_buttons" is enabled
  And I go to a proposal
  When I click the share proposal button
  Then I should see the share dropdown
  And I click the share link button
  Then I should see the share link modal
