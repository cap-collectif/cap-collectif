@admin @translation @blog
Feature: Write blog posts
  In order to write blog posts
  As an adminstrator
  I want to be able to write in my readers language

@database
Scenario: Adminstrator wants to edit a blog post in fr-FR with multilangues enabled
  Given feature 'unstable__multilangue' is enabled
  And I am logged in as admin
  And I set my locale to "fr-FR"
  And I go to the admin blog post list page
  Then I should see "Post FR 9" appear on current page in ".sonata-ba-list"
  And I follow "Post FR 9"
  Then I should be redirected to "/admin/capco/app/post/post9/edit?tl=fr-FR"
  Then I should see "Post FR 9" appear on current page in ".navbar-brand"
  And the "global.title" field should contain "Post FR 9"

@database
Scenario: Administrator wants to edit a blog post in en-GB with multilangues enabled
  Given feature 'unstable__multilangue' is enabled
  And I am logged in as admin
  And I set my locale to "en-GB"
  And I go to the admin blog post list page
  Then I should see "Post EN 9" appear on current page in ".sonata-ba-list"
  And I follow "Post EN 9"
  Then I should be redirected to "/admin/capco/app/post/post9/edit?tl=en-GB"
  Then I should see "Post EN 9" appear on current page in ".navbar-brand"
  And the "global.title" field should contain "Post EN 9"

@database
Scenario: Adminstrator wants to edit a blog post in fr-FR with multilangues disabled
  Given feature 'unstable__multilangue' is disabled
  And default locale is set to "fr-FR"
  And I am logged in as admin
  And I go to the admin blog post list page
  Then I should see "Post FR 9" appear on current page in ".sonata-ba-list"
  And I follow "Post FR 9"
  Then I should be redirected to "/admin/capco/app/post/post9/edit?tl=fr-FR"
  Then I should see "Post FR 9" appear on current page in ".navbar-brand"
  And the "global.title" field should contain "Post FR 9"

@database
Scenario: Adminstrator wants to edit a blog post in en-GB with multilangues disabled
  Given feature 'unstable__multilangue' is disabled
  And default locale is set to "en-GB"
  And I am logged in as admin
  And I go to the admin blog post list page
  Then I should see "Post EN 9" appear on current page in ".sonata-ba-list"
  And I follow "Post EN 9"
  Then I should be redirected to "/admin/capco/app/post/post9/edit?tl=en-GB"
  Then I should see "Post EN 9" appear on current page in ".navbar-brand"
  And the "global.title" field should contain "Post EN 9"
