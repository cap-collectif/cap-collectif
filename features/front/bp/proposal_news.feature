@bp @proposal_news
Feature: Proposal news

@database @rabbitmq
Scenario: User add news on a proposal and admin should be notified if the proposal have proposal news notifications on
  Given feature "blog" is enabled
  Given I am logged in as ian
  And I go to a proposal which is not news notifiable
  Then I click on button to add news
  And I fill in the following:
    | title                | Une super actualité  |
    | abstract             | Un résumé            |
  And I fill proposal news body field
  And I wait 1 seconds
  Then I publish my news
  And I should be redirected to '/blog/une-super-actualite'

@database @rabbitmq
Scenario: User can update his news and admin should be notified
  Given feature "blog" is enabled
  Given I am logged in as user
  And I go to a proposal which is news notifiable
  And I follow "Remerciment"
  Then I click on button to edit news
  And I fill in the following:
    | abstract             | Un résumé modifié  |
  Then I publish my updated news

@database @rabbitmq
Scenario: User can delete his news and admin should not be notified
  Given feature "blog" is enabled
  Given I am logged in as ian
  And I go to a proposal which is not news notifiable
  And I follow "Mon premier article"
  Then I click on button to edit news
  And I click on button to delete news
  Then I confirm to delete my news
  And I should be redirected to '/projects/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-local-en-tant-quassociation-avec-rna'
