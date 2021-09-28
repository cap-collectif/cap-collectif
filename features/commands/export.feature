@export
Feature: Export Commands

Background:
  Given feature "export" is enabled

@database
Scenario: Admin wants to export projects contributors
  Given I run a command "capco:export:projects-contributors" with parameters:
    | --delimiter | , |
  Then the command exit code should be 0
  And exported "csv" file with name "participants_appel-a-projets.csv" should match its snapshot
  And exported "csv" file with name "participants_bp-avec-vote-classement.csv" should match its snapshot
  And exported "csv" file with name "participants_budget-avec-vote-limite.csv" should match its snapshot
  And exported "csv" file with name "participants_budget-participatif-rennes.csv" should match its snapshot
  And exported "csv" file with name "participants_croissance-innovation-disruption.csv" should match its snapshot
  And exported "csv" file with name "participants_depot-avec-selection-vote-budget.csv" should match its snapshot
  And exported "csv" file with name "participants_depot-avec-selection-vote-simple.csv" should match its snapshot
  And exported "csv" file with name "participants_le-p16-un-projet-a-base-de-riz.csv" should match its snapshot
  And exported "csv" file with name "participants_project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement.csv" should match its snapshot
  And exported "csv" file with name "participants_project-pour-la-force-visible-par-mauriau-seulement.csv" should match its snapshot
  And exported "csv" file with name "participants_projet-a-venir.csv" should match its snapshot
  And exported "csv" file with name "participants_projet-avec-questionnaire.csv" should match its snapshot
  And exported "csv" file with name "participants_projet-avec-une-etape-de-participation-en-continue.csv" should match its snapshot
  And exported "csv" file with name "participants_projet-de-loi-renseignement.csv" should match its snapshot
  And exported "csv" file with name "participants_projet-sans-etapes-participatives.csv" should match its snapshot
  And exported "csv" file with name "participants_projet-vide.csv" should match its snapshot
  And exported "csv" file with name "participants_questions-responses.csv" should match its snapshot
  And exported "csv" file with name "participants_qui-doit-conquerir-le-monde-visible-par-les-admins-seulement.csv" should match its snapshot
  And exported "csv" file with name "participants_strategie-technologique-de-letat-et-services-publics.csv" should match its snapshot
  And exported "csv" file with name "participants_transformation-numerique-des-relations.csv" should match its snapshot
  And exported "csv" file with name "participants_un-avenir-meilleur-pour-les-nains-de-jardins-custom-access.csv" should match its snapshot

Scenario: Admin wants to export consultation steps
  Given I run a command "capco:export:consultation" with parameters:
    | --delimiter | , |
  Then the command exit code should be 0
  And exported "csv" file with name "croissance-innovation-disruption_collecte-des-avis.csv" should match its snapshot
  And exported "csv" file with name "projet-de-loi-renseignement_elaboration-de-la-loi.csv" should match its snapshot
  And exported "csv" file with name "projet-vide_projet.csv" should match its snapshot
  And exported "csv" file with name "strategie-technologique-de-letat-et-services-publics_collecte-des-avis-pour-une-meilleur-strategie.csv" should match its snapshot
  And exported "csv" file with name "strategie-technologique-de-letat-et-services-publics_etape-de-multi-consultation.csv" should match its snapshot
  And exported "csv" file with name "transformation-numerique-des-relations_ma-futur-collecte-de-proposition.csv" should match its snapshot
  And exported "csv" file with name "df7f805d45b7ee459f571183eed9d25d.csv" should match its snapshot

@database
Scenario: Admin wants to export collect steps
  Given I run a command "capco:export:proposalStep" with parameters:
    | --delimiter | , |
  Then the command exit code should be 0
  And exported "csv" file with name "budget-participatif-rennes_depot-avec-vote.csv" should match its snapshot
  And exported "csv" file with name "appel-a-projets_collecte-des-propositions-avec-vote-simple.csv" should match its snapshot
  And exported "csv" file with name "bp-avec-vote-classement_collecte-avec-vote-classement-limite.csv" should match its snapshot
  And exported "csv" file with name "bp-avec-vote-classement_selection-avec-vote-classement-limite.csv" should match its snapshot
  And exported "csv" file with name "budget-avec-vote-limite_collecte-avec-vote-simple-limite-1.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_collecte-des-propositions-fermee.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_collecte-des-propositions-privee.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_collecte-des-propositions.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_collecte-des-propositions-avec-questions.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_fermee.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_realisation.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_selection-a-venir.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_vainqueur.csv" should match its snapshot
  And exported "csv" file with name "depot-avec-selection-vote-budget_collecte-des-propositions-1.csv" should match its snapshot
  And exported "csv" file with name "depot-avec-selection-vote-simple_depot-ferme.csv" should match its snapshot
  And exported "csv" file with name "depot-avec-selection-vote-simple_selection-avec-vote-simple.csv" should match its snapshot
  And exported "csv" file with name "project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement_collecte-des-propositions-pour-la-capcobeer.csv" should match its snapshot
  And exported "csv" file with name "project-pour-la-force-visible-par-mauriau-seulement_collecte-des-propositions-pour-la-force.csv" should match its snapshot
  And exported "csv" file with name "projet-avec-une-etape-de-participation-en-continue_collecte-avec-vote-simple-limite-2.csv" should match its snapshot
  And exported "csv" file with name "questions-responses_collecte-des-questions-chez-youpie.csv" should match its snapshot
  And exported "csv" file with name "questions-responses_selection-de-questions-avec-vote-classement-limite.csv" should match its snapshot
  And exported "csv" file with name "qui-doit-conquerir-le-monde-visible-par-les-admins-seulement_collecte-des-propositions-pour-conquerir-le-monde.csv" should match its snapshot
  And exported "csv" file with name "un-avenir-meilleur-pour-les-nains-de-jardins-custom-access_collecte-des-propositions-liberer-les-nains-de-jardin.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-idf_collecte-des-projets-idf-privee.csv" should match its snapshot
  And exported "csv" file with name "projet-pour-consolider-les-exports_etape-de-depot-des-exports.csv" should match its snapshot
  And exported "csv" file with name "projet-pour-consolider-les-exports_selectionstepexport.csv" should match its snapshot
  And exported "csv" file with name "projet-avec-administrateur-de-projet_budget-participatif-du-projet-avec-administrateur-de-projet.csv" should match its snapshot
  And exported "csv" file with name "projet-avec-administrateur-de-projet_budget-participatif-du-projet-avec-administrateur-de-projet-project-admin.csv" should match its snapshot

@database
Scenario: User want to export his datas and 7 days after the cron delete the zip archive
  Given I run "capco:export:user userAdmin --delimiter ','"
  And the command exit code should be 0
  Then personal data archive for user "userAdmin" should match its snapshot
  And I run "capco:user_archives:delete"
  And the command exit code should be 0
  Then the archive for user "userAdmin" should be deleted

@database @randomly-failing
Scenario: Admin wants to export users
  Given I run a command "capco:export:users" with parameters:
    | --delimiter |,|
  And exported "csv" file with name "users.csv" should match its snapshot
  Then the command exit code should be 0

Scenario: Admin wants to export users
  Given feature "export_legacy_users" is enabled
  Then I run a command "capco:export:legacyUsers" with parameters:
    | --delimiter |,|
  And exported "csv" file with name "legacyUsers.csv" should match its snapshot
  Then the command exit code should be 0

Scenario: Admin wants to export questionnaires
  Given I run a command "capco:export:questionnaire" with parameters:
    | --delimiter |,|
  And exported "csv" file with name "consultation-pour-conquerir-le-monde.csv" should match its snapshot
  And exported "csv" file with name "consultation-pour-la-capcobeer.csv" should match its snapshot
  And exported "csv" file with name "consultation-pour-la-flnj.csv" should match its snapshot
  And exported "csv" file with name "projet-avec-questionnaire_essais-de-sauts-conditionnels.csv" should match its snapshot
  And exported "csv" file with name "projet-avec-questionnaire_etape-de-questionnaire-avec-questionnaire-sauts-conditionnels.csv" should match its snapshot
  And exported "csv" file with name "projet-avec-questionnaire_etape-de-questionnaire-fermee.csv" should match its snapshot
  And exported "csv" file with name "projet-avec-questionnaire_questionnaire-des-jo-2024.csv" should match its snapshot
  And exported "csv" file with name "projet-avec-questionnaire_questionnaire.csv" should match its snapshot
  And exported "csv" file with name "projet-pour-le-group2_questionnaire-step-pour-group2.csv" should match its snapshot
  And exported "csv" file with name "questionnaire-non-rattache.csv" should match its snapshot
  And exported "csv" file with name "questionnaire-pour-budget-participatif-de-la-force.csv" should match its snapshot
  And exported "csv" file with name "questionnaire-pour-budget-participatif-disponible.csv" should match its snapshot
  And exported "csv" file with name "questionnaire-pour-budget-participatif.csv" should match its snapshot
  And exported "csv" file with name "qui-doit-conquerir-le-monde-visible-par-les-admins-seulement_questionnaire-step-pour-admins.csv" should match its snapshot
  Then the command exit code should be 0

Scenario: Project admin wants to export questionnaires
  Given I run a command "capco:export:questionnaire" with parameters:
    | --delimiter |,|
  And exported "csv" file with name "projet-avec-administrateur-de-projet_questionnaire-administrateur-de-projet-project-admin.csv" should match its snapshot
  And exported "csv" file with name "projet-avec-administrateur-de-projet_questionnaire-administrateur-de-projet-2-project-admin.csv" should match its snapshot
  Then the command exit code should be 0

Scenario: Admin wants to export event participants
  Given I run a command "capco:export:events:participants" with parameters:
    | --delimiter |,|
  Then the command exit code should be 0
  And exported "csv" file with name "participants-event-with-registrations.csv" should match its snapshot
  And exported "csv" file with name "participants-grenobleweb2015.csv" should match its snapshot

Scenario: Admin wants to export steps contributors
  Given I run a command "capco:export:step-contributors" with parameters:
    | --delimiter |,|
  Then the command exit code should be 0
  And exported step contributors files should match their snapshots

Scenario: Admin wants to export events
  Given I run a command "capco:export:events" with parameters:
    | --delimiter |,|
  Then the command exit code should be 0
  And exported "csv" file with name "events.csv" should match its snapshot

Scenario: Admin wants to export proposal analysis
  Given I run a command "capco:export:analysis" with parameters:
    | --delimiter |,|
  And exported "csv" file with name "project-budget-participatif-idf-analysis.csv" should match its snapshot
  And exported "csv" file with name "project-project-analyse-analysis.csv" should match its snapshot
  And exported "csv" file with name "project-projet-avec-administrateur-de-projet-analysis.csv" should match its snapshot
  And exported "csv" file with name "project-projet-avec-administrateur-de-projet-analysis-project-admin.csv" should match its snapshot
  Then the command exit code should be 0

Scenario: Admin wants to export proposal decisions
  Given I run a command "capco:export:analysis" with parameters:
    | --delimiter |,|
    | --only-decisions | true |
  Then the command exit code should be 0
  And exported "csv" file with name "project-budget-participatif-idf-decision.csv" should match its snapshot
  And exported "csv" file with name "project-project-analyse-decision.csv" should match its snapshot
  And exported "csv" file with name "project-projet-avec-administrateur-de-projet-decision.csv" should match its snapshot
  And exported "csv" file with name "project-projet-avec-administrateur-de-projet-decision-project-admin.csv" should match its snapshot

@snapshot
Scenario: Admin wants to export debate arguments and votes
  Given I run a command "capco:export:debate" with parameters:
    | --delimiter |,|
  Then the command exit code should be 0
  And exported "csv" file with name "debate-debateCannabis-arguments.csv" should match its snapshot
  And exported "csv" file with name "debate-debateConfinement-arguments.csv" should match its snapshot
  And exported "csv" file with name "debate-debateOculusQuest-arguments.csv" should match its snapshot
  And exported "csv" file with name "debate-debateWysiwyg-arguments.csv" should match its snapshot
  And exported "csv" file with name "debate-debateCannabis-votes.csv" should match its snapshot
  And exported "csv" file with name "debate-debateConfinement-votes.csv" should match its snapshot
  And exported "csv" file with name "debate-debateOculusQuest-votes.csv" should match its snapshot
  And exported "csv" file with name "debate-debateWysiwyg-votes.csv" should match its snapshot
  And exported "csv" file with name "debate-debateProjectAdmin-arguments.csv" should match its snapshot
  And exported "csv" file with name "debate-debateProjectAdmin-arguments-project-admin.csv" should match its snapshot
  And exported "csv" file with name "debate-debateProjectAdmin-votes.csv" should match its snapshot
  And exported "csv" file with name "debate-debateProjectAdmin-votes-project-admin.csv" should match its snapshot
