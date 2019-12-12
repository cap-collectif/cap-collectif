@consultation @opinions
Feature: Opinions

@database
Scenario: Can create an opinion of contribuable type in opened project
  Given I am logged in as user
  And I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  When I click the "#btn-add--les-causes" element
  And I wait "#opinion-create-form" to appear on current page
  And I fill in the following:
    | opinion_title | Titre                           |
    | opinion_body  | Description de ma proposition   |
  And I press "confirm-opinion-create"
  And I wait 2 seconds
  Then I should be redirected to "/projects/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/les-causes/titre"

Scenario: Can't create an opinion of non-contribuable type in opened project
  Given I am logged in as user
  And I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  And I wait "#opinions--test17le-probleme-constate" to appear on current page
  Then I should not see a "#btn-add--le-probleme-constate" element

Scenario: Can see opinions in project with endless participation
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement |
    | stepSlug    | etape-participation-continue                                         |
  Then I should see "Étape participation continue"

@read-only
Scenario: An anonymous can paginate opinions inside a section
  Given I am logged in as user
  And I visited "section page" with:
    | projectSlug | projet-de-loi-renseignement |
    | stepSlug    | elaboration-de-la-loi       |
    | sectionSlug | chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/sous-partie-1       |
    | consultationSlug | projet-de-loi       |
  Then I should see 50 ".list-group-item__opinion" element
  When I click the "#OpinionListPaginated-loadmore" element
  And I wait 2 seconds
  Then I should see 58 ".list-group-item__opinion" element

@security
Scenario: Can not create an opinion of non-contribuable type
  Given I am logged in as user
  And I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  Then I should see 0 "#opinions--le-probleme-constate" element

@security
Scenario: Can not create an opinion in closed project
  Given I am logged in as user
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-letat-et-services-publics |
    | stepSlug    | collecte-des-avis-pour-une-meilleur-strategie         |
  Then I should see "step.consultation.alert.ended.title" in the "#main" element
  Then I should see "thank.for.contribution" in the "#main" element
  And the create opinion button should be disabled

@security
Scenario: Can not create an opinion when not logged in
  Given I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  When I click the "#btn-add--les-causes" element
  Then I should see a "#login-popover" element

@database
Scenario: Logged in user can report an opinion
  Given feature "reporting" is enabled
  And I am logged in as admin
  And I go to an opinion
  When I click the "#report-opinion-opinion2-button" element
  And I fill the reporting form
  And I submit the reporting form
  Then I should see "alert.success.report.proposal" in the "#global-alert-box" element

@database
Scenario: Author of an opinion lose their votes when updating it
  Given I am logged in as user
  And I visited "opinion page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug         | collecte-des-avis                |
    | opinionTypeSlug  | enjeux                           |
    | opinionSlug      | opinion-3                        |
  And I should see 'global.votes {"num":1}'
  When I press "global.edit"
  And I wait 1 seconds
  And I fill in the following:
    | opinion_body | Je modifie ma proposition !   |
  And I check "opinion_check"
  And I press "confirm-opinion-update"
  And I wait 5 seconds
  Then I should be redirected to "/projects/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/les-enjeux/opinion-3"
  And I wait 1 seconds
  And I should see 'global.votes {"num":0}'

@security
Scenario: Non author of an opinion wants to update it
  Given I am logged in as admin
  And I visited "opinion page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug         | collecte-des-avis                |
    | opinionTypeSlug  | enjeux                           |
    | opinionSlug      | opinion-3                        |
  Then I should not see "global.change" in the ".opinion__description .opinion__buttons" element

Scenario: Anonymous user wants to see all votes of an opinion
  Given I go to an opinion with loads of votes
  When I click the show all opinion votes button
  Then I should see all opinion votes

Scenario: Anonymous user wants to share an opinion
  Given feature "share_buttons" is enabled
  And I go to an opinion with versions
  When I click the share opinion button
  Then I should see the opinion share dropdown
  And I click the opinion share link button
  Then I should see the share link modal

Scenario: Anonymous user wants to see rankings of opinions
  Given I go to a ranking step with opinions
  Then I should not see "error.500"

@elasticsearch @dev
Scenario: Project's opinions can be sorted randomly
  Given feature "projects_form" is enabled
  And I visited "opinion list page" with:
    | projectSlug      | projet-avec-beaucoup-dopinions                             |
    | stepSlug         | consultation-step-in-project-with-many-opinions            |
    | opinionTypeSlug  | opinion-type-avec-beaucoup-doptions                        |
    | consultationSlug | consultation-in-project-with-many-opinions                 |
  And I select "global.filter_random" from "opinion-ordering-selector"
  And I wait "#OpinionListPaginated-loadmore" to appear on current page
  # 51 because the opinion button to load more counts
  Then The element ".opinion-list-rendered" should contain 51 sub-elements
  And I scroll to the bottom
  And I click on button "[id='OpinionListPaginated-loadmore']"
  And I wait "#OpinionListPaginated-end-pagination" to appear on current page
  # 71 because the opinion button to load more doesn't exist anymore
  Then The element ".opinion-list-rendered" should contain 71 sub-elements

Scenario: Anonymous want to filter opinion versions
  Given I go to an opinion with versions
  And I go on the versions tab
  And The first version in list should be "Modification 3"
  Then I select "old" from "filter-opinion-version"
  And The first version in list should be "Modification 1"
