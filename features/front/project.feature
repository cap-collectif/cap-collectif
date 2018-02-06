@project
Feature: Project

Scenario: Can not sort or filter if feature projects_form is disabled
  Given I visited "projects page"
  Then I should not see "project-theme"

@javascript @elasticsearch
Scenario: Project can be sorted by published date
  Given feature "projects_form" is enabled
  And I visited "projects page"
  And I wait 1 seconds
  And I select "global.filter_f_last" from "project-sorting"
  And I wait 1 seconds
  Then "Projet vide" should be before "Dépot avec selection vote budget" for selector ".thumbnail--custom .project__preview__title a"

@javascript @elasticsearch
Scenario: Project can be sorted by contributions number
  Given feature "projects_form" is enabled
  And I visited "projects page"
  And I select "global.filter_f_popular" from "project-sorting"
  And I wait 1 seconds
  Then "Croissance, innovation, disruption" should be before "Projet de loi Renseignement" for selector ".thumbnail--custom .project__preview__title a"

@javascript
Scenario: Project can be filtered by theme
  Given feature "themes" is enabled
  And feature "projects_form" is enabled
  And I visited "projects page"
  And I wait 1 seconds
  Then I should see 13 ".thumbnail--custom" elements
  And I select "Transport" from "project-theme"
  And I wait 1 seconds
  Then I should see 7 ".thumbnail--custom" elements
  And I should see "Projet vide"
  And I should see "Dépot avec selection vote budget"
  And I should not see "Croissance, innovation, disruption"

@javascript
Scenario: Project can be filtered by theme and sorted by contributions number at the same time
  Given feature "themes" is enabled
  And feature "projects_form" is enabled
  And I visited "projects page"
  And I select "Transport" from "project-theme"
  And I wait 1 seconds
  And I select "global.filter_f_popular" from "project-sorting"
  And I wait 1 seconds
  Then I should see 7 ".thumbnail--custom" elements
  And I should see "Projet de loi Renseignement"
  And I should see "Budget Participatif Rennes"
  And I should not see "Croissance, innovation, disruption"
  And "Stratégie technologique de l'Etat et services publics" should be before "Projet vide" for selector ".thumbnail--custom .project__preview__title a"

@javascript
Scenario: Project can be filtered by type and sorted by contributions number at the same time
  And feature "projects_form" is enabled
  And I visited "projects page"
  And I select "project.types.consultation" from "project-type"
  And I wait 1 seconds
  And I select "global.filter_f_popular" from "project-sorting"
  And I wait 1 seconds
  Then I should see 5 ".thumbnail--custom" elements
  And I should see "Projet de loi Renseignement"
  And I should see "Stratégie technologique de l'Etat et services publics"
  And I should not see "Croissance, innovation, disruption"
  And "Stratégie technologique de l'Etat et services publics" should be before "Projet vide" for selector ".thumbnail--custom .project__preview__title a"

@javascript
Scenario: Project can be filtered by title
  Given feature "projects_form" is enabled
  And I visited "projects page"
  When I fill in the following:
    | project-search-input | innovation |
  And I click the "#project-search-button" element
  And I wait 1 seconds
  Then I should see 1 ".thumbnail--custom" elements
  And I should see "Croissance, innovation, disruption"
  And I should not see "Stratégie technologique de l'Etat et services publics"
  And I should not see "Projet vide"

Scenario: Presentation step should display correct number of element
  Given feature "calendar" is enabled
  And feature "blog" is enabled
  And I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  And I follow "Présentation"
  Then I should see 2 ".media--news" elements
  And I should see 2 ".event" elements

Scenario: Events menu for project should display correct number of events
  Given feature "calendar" is enabled
  And I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  And I follow "events_link"
  And I should see 3 ".event" elements

Scenario: Posts menu for project should display correct number of posts
  Given feature "blog" is enabled
  And I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  And I follow "posts_link"
  And I should see 5 ".media--news" elements

Scenario: Project header should display correct number of votes
  Given I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  Then I should see "7 project.show.meta.votes_count"

@javascript
Scenario: Project header should display correct number of contributions
  Given I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  Then I should see 'project.show.meta.total_count {"%count%":160}'
  And I hover over the "#contributions-counter-pill" element
  And I wait 1 seconds
  And I should see 'project.show.meta.opinionsCount {"%count%":33}'
  #And I should see 'project.show.meta.argumentsCount {"%count%":95}'
  And I should see 'project.show.meta.sourcesCount {"%count%":32}'

Scenario: Project header should display correct number of participants
  Given I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  Then I should see "22 project.show.meta.contributors_count"

Scenario: Can not have access to download if export is disabled
  Given I visited "consultation page" with:
    | projectSlug   | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug      | collecte-des-avis-pour-une-meilleur-strategie         |
  Then I should not see "project.download.button" in the "#main" element

@javascript
Scenario: Can not download a project if export is disabled
  Given I visited "home page"
  When I try to download "projets/strategie-technologique-de-l-etat-et-services-publics/projet/collecte-des-avis-pour-une-meilleur-strategie/download/xls"
  Then I should see 'error.404.title {"%code%":404}'

@javascript
Scenario: Can not access trash if feature is disabled
  Given I am logged in as user
  And I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  Then I should not see "project.show.meta.info.trash" in the "#main" element

@javascript
Scenario: Can not access trash if not logged in
  Given feature "project_trash" is enabled
  And I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  And I should see "project.show.meta.info.trash" in the "#main" element
  When I click the "#trash-link" element
  And I wait 1 seconds
  Then I should see a "#login-popover" element

@javascript
Scenario: Project trash display correct numbers of elements
  Given feature "project_trash" is enabled
  And I am logged in as user
  And I visited "consultation page" with:
    | projectSlug | croissance-innovation-disruption |
    | stepSlug    | collecte-des-avis                |
  When I follow "project.show.meta.info.trash"
  Then I should see 100 ".opinion__list .opinion" elements
  And I should see "100" in the "span.badge" element
