Feature: Members

Background:
  Given feature "members_list" is enabled

Scenario: Can see list of members
  Given feature "user_type" is enabled
  And I visited "members page"
  Then I should see 16 ".media--user-thumbnail" elements
