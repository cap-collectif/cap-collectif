@proposal_comments
Feature: Proposal comments

@javascript @database @rabbitmq
Scenario: User comment a proposal and admin should be notified if the proposal have comments notifications on
  Given I am logged in as user
  And I go to a proposal which is comment notifiable
  And I comment "Salut les filles"
  Then the queue associated to "comment_create" producer has messages below:
  | 0 | {"commentId": "@string@"} |

@javascript @database @rabbitmq
Scenario: User comment a proposal and admin should not be notified if the proposal have comments notifications off
  Given I am logged in as user
  And I go to a proposal which is not comment notifiable
  And I comment "Salut les filles"
  Then the queue associated to "comment_create" producer has messages below:
  | 0 | {"commentId": "@string@"} |

@javascript @database @rabbitmq
Scenario: Anonymous user comment a proposal and admin should be notified if the proposal have comments notifications on
  Given I go to a proposal which is comment notifiable
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  Then the queue associated to "comment_create" producer has messages below:
  | 0 | {"commentId": "@string@"} |

@javascript @database @rabbitmq
Scenario: Anonymous user comment a proposal and admin should not be notified if the proposal have comments notifications off
  Given I go to a proposal which is not comment notifiable
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  Then the queue associated to "comment_create" producer has messages below:
  | 0 | {"commentId": "@string@"} |

@javascript @database @rabbitmq
Scenario: User update his comment and admin should be notified if the proposal have comments notifications on
  Given I am logged in as user
  And I go to a proposal which is comment notifiable
  And I comment "Salut les filles"
  And I click the edit comment button
  And I fill and submit the edit comment form with "Salut les filles, il faut que vous essayiez ce DOP à la madeleine"
  Then the queue associated to "comment_update" producer has messages below:
  | 0 | {"commentId": "@string@"} |

@javascript @database @rabbitmq
Scenario: User update his comment and admin should not be notified if the proposal have comments notifications off
  Given I am logged in as user
  And I go to a proposal which is not comment notifiable
  And I comment "Salut les filles"
  And I click the edit comment button
  And I fill and submit the edit comment form with "Salut les filles, il faut que vous essayiez ce DOP à la madeleine"
  Then the queue associated to "comment_update" producer has messages below:
  | 0 | {"commentId": "@string@"} |
