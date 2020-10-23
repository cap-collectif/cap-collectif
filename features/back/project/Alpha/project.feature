@admin @project
Feature: Alpha Projects features

@database
Scenario: Logged in admin wants to edit alpha admin project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project12/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I fill in the following:
    | metaDescription    | Such meta      |
    | video    | https://www.youtube.com/watch?v=dQw4w9WgXcQ      |
  And I click the "#districts .select-container" element
  And I fill the "#districts" react element with child number 1
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/consultation/projet-sans-etapes-participatives/presentation/presentation-3"
  And I wait ".cap-marker-1" to appear on current page
  Then I should see "Centre ville"

@database
Scenario: Logged in super admin wants to restrict a project
  Given I am logged in as super admin
  Then I go to "/admin/alpha/project/project12/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#label-radio-project-visibility-CUSTOM" element
  And I click the "#project-restrictedViewerGroups .react-select__value-container .react-select__input input" element
  And I fill the "#project-restrictedViewerGroups" react element with child number 1
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/consultation/projet-sans-etapes-participatives/presentation/presentation-3"
  And I wait "#restricted-access" to appear on current page

@database
Scenario: Logged in admin wants to add a presentation step to a project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#js-btn-create-step + ul li:nth-child(1)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | PresentationStepLabel      |
    | step-title    | PresentationStepTitle      |
    | step-body     | PresentationStepBody       |
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/presentation/presentationsteptitle"
  And I wait "#details" to appear on current page
  Then I should see "PresentationStepTitle"
  Then I should see "PresentationStepBody"

@database
Scenario: Logged in admin wants to add questionnaire step to a project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#js-btn-create-step + ul li:nth-child(7)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | QuestionnaireStepLabel      |
    | step-title    | QuestionnaireStepTitle      |
    | step-body     | QuestionnaireStepBody       |
    | step-footer   | QuestionnaireStepFooter     |
  And I fill the date field in ".modal-content"
  And I click the "#step-questionnaire .select-container" element
  And I fill the "#step-questionnaire" react element with child number 1
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/questionnaire/questionnairesteptitle"
  And I wait "#QuestionnaireStepTabs" to appear on current page
  Then I should see "QuestionnaireStepTitle"
  Then I should see "QuestionnaireStepBody"
  Then I should see "QuestionnaireStepFooter"

@database
Scenario: Logged in admin wants to add consultation step to a project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#js-btn-create-step + ul li:nth-child(4)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | ConsultationStepLabel      |
    | step-title    | ConsultationStepTitle      |
    | step-body     | ConsultationStepBody       |
  And I fill the date field in ".modal-content"
  And I click the "#step-consultations .select-container" element
  And I fill the "#step-consultations" react element with child number 1
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/consultation/consultationsteptitle"
  And I wait "#scroll-content" to appear on current page
  Then I should see "ConsultationStepTitle"
  Then I should see "ConsultationStepBody"

@database
Scenario: Logged in admin wants to add collect step to a project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#js-btn-create-step + ul li:nth-child(2)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | CollectStepLabel      |
    | step-title    | CollectStepTitle      |
    | step-body     | CollectStepBody       |
  And I fill the date field in ".modal-content"
  And I click the "#step-proposalForm .select-container" element
  And I fill the "#step-proposalForm" react element with child number 1
  And I check element "grid"
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/collect/collectsteptitle"
  And I wait "#ProposalStepPage-rendered" to appear on current page
  Then I should see "CollectStepTitle"
  Then I should see "CollectStepBody"

@database
Scenario: Logged in admin wants to add a presentation step to a project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#js-btn-create-step + ul li:nth-child(1)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | PresentationStepLabel      |
    | step-title    | PresentationStepTitle      |
    | step-body     | PresentationStepBody       |
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/presentation/presentationsteptitle"
  And I wait "#details" to appear on current page
  Then I should see "PresentationStepTitle"
  Then I should see "PresentationStepBody"

@database
Scenario: Logged in admin wants to add a ranking step to a project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#js-btn-create-step + ul li:nth-child(6)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | RankingStepLabel      |
    | step-title    | RankingStepTitle      |
    | step-body     | RankingStepBody       |
    | step-nbOpinionsToDisplay     | 5           |
    | step-nbVersionsToDisplay     | 2           |
  And I fill the date field in ".modal-content"
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/ranking/rankingsteptitle"
  And I wait "#details" to appear on current page
  Then I should see "RankingStepTitle"
  Then I should see "RankingStepBody"
  Then I should see "opinion.show.none"

@database
Scenario: Admin merges two proposals
  Given I am logged in as admin
  And I go to "/admin/alpha/project/projectCorona/proposals?step=Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBDb3JvbmE%3D"
  And I wait ".analysis-pickable-list-container" to appear on current page
  Then I select the first 2 checkboxes in list ".pickableList-row"
  And I click on button "#merge-button"
  And I fill in the following:
    | title | Merged proposal |
  And I click on button "#merge-proposal-submit-button"
  And I wait "#merge-proposal-submit-button" to disappear on current page
  And I go to "/admin/alpha/project/projectCorona/proposals?step=Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBDb3JvbmE%3D"
  And I wait ".analysis-pickable-list-container" to appear on current page
  And the number 1 element in ".pickableList-row h2 a" should contain "Merged proposal"
  And I should see 2 ".merge-tag" elements

@database
Scenario: Admin merges two proposals
  Given I am logged in as admin
  And I go to "/admin/alpha/project/projectIdf/participants"
  And I wait "#export-button" to appear on current page
  And I click on button "#export-button"
  # Only 1 export should be visible for other don't have participants
  And I should see 1 ".export-option" elements
