Feature: Project Admin

@database
Scenario: Logged in as super admin wants to add an external project.
  Given I am logged in as super admin
  Given I visited "admin project page"
  And I wait 1 seconds
  When I click the add button
  Then I should be redirected to "admin/capco/app/project/create"
  And I should see "admin.fields.project.group_external"
  Then I check "external-project"
  And I fill in select2 input "#s2id_autogen5" with "mauriau" and select "mauriau"
  And I fill in the following:
    | admin.fields.project.title  | my external project |
    | admin.fields.project.externalLink   | http://my-otherconsultation.com |
    | admin.fields.project.participantsCount   | 10 |
    | admin.fields.project.contributionsCount   | 20 |
    | admin.fields.project.votesCount   | 30 |

@database
Scenario: Logged in as admin wants to add a project.
  Given I am logged in as admin
  Given I visited "admin project page"
  And I wait 1 seconds
  When I click the add button
  Then I should be redirected to "admin/capco/app/project/create"
  And I should not see "admin.fields.project.group_external"