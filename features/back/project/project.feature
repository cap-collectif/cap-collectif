@admin @project
Feature: Projects features

Scenario: Logged in admin wants to test admin project
  Given I am logged in as admin
  And I go to the admin project list page
  And I should not see "error.500"
  And I go to the admin appendix list page
  And I should not see "error.500"
  And I go to the admin source list page
  And I should not see "error.500"
  And I go to the admin consultation list page
  And I should not see "error.500"
  And I go to the admin project type list page
  And I should not see "error.500"
  And I go to the admin proposal list page
  And I should not see "error.500"
  And I go to the admin questionnaire list page
  And I should not see "error.500"

@multiple-windows
Scenario: Logged in admin want to see project from project list
  Given I am logged in as admin
  Then I go to the admin project list page
  And I click the ".sonata-ba-list-field-actions[objectid='project1'] div a" element
  Then I switch to window 1
  And I should be on "/consultation/croissance-innovation-disruption/presentation/presentation-1"
  And I should not see "error.500"
  And I should not see "error.400"

@multiple-windows
Scenario: Logged in admin want to see project from project list
  Given I am logged in as admin
  Then I go to "/admin/capco/app/project/project2/edit"
  And I click the "#action_show" element
  Then I switch to window 1
  And I should be on "/project/strategie-technologique-de-letat-et-services-publics/consultation/collecte-des-avis-pour-une-meilleur-strategie"
  And I should not see "error.404"
  And I should not see "error.500"

Scenario: Another admin wants to see admin's project in BO (should be visible)
  Given I am logged in as adminCapco
  Then I go to "/admin/capco/app/post/list?filter%5Btitle%5D%5Btype%5D=&filter%5Btitle%5D%5Bvalue%5D=&filter%5Bthemes%5D%5Btype%5D=&filter%5Bthemes%5D%5Bvalue%5D=&filter%5Bproposals%5D%5Btype%5D=&filter%5Bproposals%5D%5Bvalue%5D=&filter%5Bprojects%5D%5Btype%5D=&filter%5Bprojects%5D%5Bvalue%5D=ProjectAccessibleForMeOnlyByAdmin&filter%5Bbody%5D%5Btype%5D=&filter%5Bbody%5D%5Bvalue%5D=&filter%5BcreatedAt%5D%5Btype%5D=&filter%5BcreatedAt%5D%5Bvalue%5D=&filter%5BisPublished%5D%5Btype%5D=&filter%5BisPublished%5D%5Bvalue%5D=&filter%5Bcommentable%5D%5Btype%5D=&filter%5Bcommentable%5D%5Bvalue%5D=&filter%5BpublishedAt%5D%5Btype%5D=&filter%5BpublishedAt%5D%5Bvalue%5D=&filter%5BupdatedAt%5D%5Btype%5D=&filter%5BupdatedAt%5D%5Bvalue%5D=&filter%5BAuthors%5D%5Btype%5D=&filter%5BAuthors%5D%5Bvalue%5D=&filter%5B_page%5D=1&filter%5B_sort_by%5D=createdAt&filter%5B_sort_order%5D=DESC&filter%5B_per_page%5D=32"
  And I should not see "no_result"

Scenario: Author wants to see his personal project in BO
  Given I am logged in as admin
  Then I go to "/admin/capco/app/post/list?filter%5Btitle%5D%5Btype%5D=&filter%5Btitle%5D%5Bvalue%5D=&filter%5Bthemes%5D%5Btype%5D=&filter%5Bthemes%5D%5Bvalue%5D=&filter%5Bproposals%5D%5Btype%5D=&filter%5Bproposals%5D%5Bvalue%5D=&filter%5Bprojects%5D%5Btype%5D=&filter%5Bprojects%5D%5Bvalue%5D=ProjectAccessibleForMeOnlyByAdmin&filter%5Bbody%5D%5Btype%5D=&filter%5Bbody%5D%5Bvalue%5D=&filter%5BcreatedAt%5D%5Btype%5D=&filter%5BcreatedAt%5D%5Bvalue%5D=&filter%5BisPublished%5D%5Btype%5D=&filter%5BisPublished%5D%5Bvalue%5D=&filter%5Bcommentable%5D%5Btype%5D=&filter%5Bcommentable%5D%5Bvalue%5D=&filter%5BpublishedAt%5D%5Btype%5D=&filter%5BpublishedAt%5D%5Bvalue%5D=&filter%5BupdatedAt%5D%5Btype%5D=&filter%5BupdatedAt%5D%5Bvalue%5D=&filter%5BAuthors%5D%5Btype%5D=&filter%5BAuthors%5D%5Bvalue%5D=&filter%5B_page%5D=1&filter%5B_sort_by%5D=createdAt&filter%5B_sort_order%5D=DESC&filter%5B_per_page%5D=32"
  And I should not see "no_result"

