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
Scenario: User want to export his datas and 7 days after the cron delete the zip archive
  Given I run "capco:export:user userAdmin --delimiter ','"
  And the command exit code should be 0
  Then personal data archive for user "userAdmin" should match its snapshot
  And I run "capco:user_archives:delete"
  And the command exit code should be 0
  Then the archive for user "userAdmin" should be deleted

Scenario: Admin wants to export legacy users
  Given feature "export_legacy_users" is enabled
  Then I run a command "capco:export:legacyUsers" with parameters:
    | --delimiter |,|
  And exported "csv" file with name "legacyUsers.csv" should match its snapshot
  Then the command exit code should be 0

Scenario: Admin wants to export event participants
  Given I run a command "capco:export:events:participants" with parameters:
    | --delimiter |,|
  Then the command exit code should be 0
  And exported "csv" file with name "participants-event-with-registrations.csv" should match its snapshot
  And exported "csv" file with name "participants-grenobleweb2015.csv" should match its snapshot

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

Scenario: Admin or Mediator wants to export projects mediators proposals votes
  Given I run a command "capco:export:projects-mediators-proposals-votes" with parameters:
    | projectId |project6|
    | --delimiter |,|
  Then the command exit code should be 0
  And exported "csv" file with name "mediators_proposals_votes_budget-participatif-rennes.csv" should match its snapshot
