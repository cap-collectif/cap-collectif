@export
Feature: Export Commands

Background:
  Given feature "export" is enabled

@parallel-scenario
Scenario: Admin wants to export consultation steps
  Given I run "capco:export:consultation"
  Then the command exit code should be 0
  And exported "csv" file with name "croissance-innovation-disruption_collecte-des-avis.csv" should match its snapshot
  And exported "csv" file with name "projet-de-loi-renseignement_elaboration-de-la-loi.csv" should match its snapshot
  And exported "csv" file with name "projet-vide_projet.csv" should match its snapshot
  And exported "csv" file with name "strategie-technologique-de-letat-et-services-publics_collecte-des-avis-pour-une-meilleur-strategie.csv" should match its snapshot
  And exported "csv" file with name "transformation-numerique-des-relations_ma-futur-collecte-de-proposition.csv" should match its snapshot

@parallel-scenario
Scenario: Admin wants to export collect steps
  Given I run "capco:export:proposalStep"
  Then the command exit code should be 0
  And exported "csv" file with name "budget-participatif-rennes_depot-avec-vote.csv" should match its snapshot
  And exported "csv" file with name "appel-a-projets_collecte-des-propositions-avec-vote-simple.csv" should match its snapshot
  And exported "csv" file with name "bp-avec-vote-classement_collecte-avec-vote-classement-limite.csv" should match its snapshot
  And exported "csv" file with name "bp-avec-vote-classement_selection-avec-vote-classement-limite.csv" should match its snapshot
  And exported "csv" file with name "budget-avec-vote-limite_collecte-avec-vote-simple-limite.csv" should match its snapshot
  And exported "csv" file with name "budget-avec-vote-limite_selection-avec-vote-budget-limite.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_collecte-des-propositions-fermee.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_collecte-des-propositions-privee.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_collecte-des-propositions.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_fermee.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_realisation.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_selection-a-venir.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_selection.csv" should match its snapshot
  And exported "csv" file with name "budget-participatif-rennes_vainqueur.csv" should match its snapshot
  And exported "csv" file with name "depot-avec-selection-vote-budget_collecte-des-propositions-1.csv" should match its snapshot
  And exported "csv" file with name "depot-avec-selection-vote-budget_selection-avec-vote-selon-le-budget.csv" should match its snapshot
  And exported "csv" file with name "depot-avec-selection-vote-simple_depot-ferme.csv" should match its snapshot
  And exported "csv" file with name "depot-avec-selection-vote-simple_selection-avec-vote-simple.csv" should match its snapshot
  And exported "csv" file with name "project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement_collecte-des-propositions-pour-la-capcobeer.csv" should match its snapshot
  And exported "csv" file with name "project-pour-la-force-visible-par-mauriau-seulement_collecte-des-propositions-pour-la-force.csv" should match its snapshot
  And exported "csv" file with name "projet-avec-une-etape-de-participation-en-continue_collecte-avec-vote-simple-limite-1.csv" should match its snapshot
  And exported "csv" file with name "questions-responses_collecte-des-questions-chez-youpie.csv" should match its snapshot
  And exported "csv" file with name "questions-responses_selection-de-questions-avec-vote-classement-limite.csv" should match its snapshot
  And exported "csv" file with name "qui-doit-conquerir-le-monde-visible-par-les-admins-seulement_collecte-des-propositions-pour-conquerir-le-monde.csv" should match its snapshot
  And exported "csv" file with name "un-avenir-meilleur-pour-les-nains-de-jardins-custom-access_collecte-des-propositions-liberer-les-nains-de-jardin.csv" should match its snapshot

@database
Scenario: Admin wants to export questionnaire steps
  Given I run "capco:export:questionnaire"
  Then the command exit code should be 0
  And exported "xlsx" file with name "projet-avec-questionnaire_essais-de-sauts-conditionnels.xlsx" should match its snapshot
  And exported "xlsx" file with name "projet-avec-questionnaire_etape-de-questionnaire-avec-questionnaire-sauts-conditionnels.xlsx" should match its snapshot
  And exported "xlsx" file with name "projet-avec-questionnaire_etape-de-questionnaire-fermee.xlsx" should match its snapshot
  And exported "xlsx" file with name "projet-avec-questionnaire_questionnaire-des-jo-2024.xlsx" should match its snapshot
  And exported "xlsx" file with name "projet-avec-questionnaire_questionnaire.xlsx" should match its snapshot

@database
Scenario: User want to export his datas and 7 days after the cron delete the zip archive
  Given I run "capco:export:user userAdmin"
  And the command exit code should be 0
  Then there should be a personal data archive for user "userAdmin"
  And I run "capco:user_archives:delete"
  And the command exit code should be 0
  Then the archive for user "userAdmin" should be deleted

@parallel-scenario
Scenario: Admin wants to export users
  Given I run "capco:export:users"
  And exported "csv" file with name "users.csv" should match its snapshot
  Then the command exit code should be 0
