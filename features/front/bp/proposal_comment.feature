@bp @proposal_comments
Feature: Proposal comments

@database
@rabbitmq
Scenario: User comment a proposal and admin should be notified if the proposal have comments notifications on
  Given I am logged in as user
  And I go to a proposal which is comment notifiable
  And I comment "Salut les filles"
  Then the queue associated to "comment_create" producer has messages below:
  | 0 | {"commentId": "@string@"} |

@database
@rabbitmq
Scenario: User comment a proposal and admin should not be notified if the proposal have comments notifications off
  Given I am logged in as user
  And I go to a proposal which is not comment notifiable
  And I comment "Salut les filles"
  Then the queue associated to "comment_create" producer has messages below:
  | 0 | {"commentId": "@string@"} |

@database
@rabbitmq
Scenario: Anonymous user comment a proposal and admin should be notified if the proposal have comments notifications on
  Given I go to a proposal which is comment notifiable
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  Then the queue associated to "comment_create" producer has messages below:
  | 0 | {"commentId": "@string@"} |

@database
@rabbitmq
Scenario: Anonymous user comment a proposal and admin should not be notified if the proposal have comments notifications off
  Given I go to a proposal which is not comment notifiable
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  Then the queue associated to "comment_create" producer has messages below:
  | 0 | {"commentId": "@string@"} |

@database @rabbitmq
Scenario: User update his comment and admin should be notified if the proposal have comments notifications on
  Given I am logged in as super admin
  And I go to a proposal made by msantostefano@jolicode.com
  And I click the edit comment button "Q29tbWVudDpwcm9wb3NhbENvbW1lbnQx"
  And I fill and submit the edit comment form with "Salut les filles, il faut que vous essayiez ce DOP à la madeleine"
  Then the queue associated to "comment_update" producer has messages below:
  | 0 | {"commentId": "@string@"} |

@database @rabbitmq
Scenario: User update his comment and admin should not be notified if the proposal have comments notifications off
  Given I am logged in as user
  And I go to a proposal which is not comment notifiable
  And I click the edit comment button "Q29tbWVudDpwcm9wb3NhbENvbW1lbnQ3Nw=="
  And I fill and submit the edit comment form with "Salut les filles, il faut que vous essayiez ce DOP à la madeleine"
  Then the queue associated to "comment_update" producer has messages below:
  | 0 | {"commentId": "@string@"} |
