Feature: Comments

# Update

  @javascript @database
Scenario: Author of a comment loose their votes when updating it
  Given feature "ideas" is enabled
  And I am logged in as user
  And I visited "ideas page"
  And I follow "Troisième idée"
  And I wait 5 seconds
  And I should see "3" in the ".opinion--comment .opinion__votes-nb" element
  When I follow "Modifier"
  And I fill in the following:
    | body      | Je modifie mon commentaire !   |
  And I check "confirm"
  And I press "Modifier"
  Then I should see "Merci ! Votre commentaire a bien été modifié."
  And I wait 5 seconds
  And I should see "0" in the ".opinion--comment .opinion__votes-nb" element

  @javascript
Scenario: Non author of a comment wants to update it
  Given feature "ideas" is enabled
  And I am logged in as admin
  And I visited "ideas page"
  And I follow "Troisième idée"
  And I wait 5 seconds
  Then I should not see "Modifier"

  @javascript
Scenario: Author of a comment try to update it without checking the confirm checkbox
  Given feature "ideas" is enabled
  And I am logged in as user
  And I visited "ideas page"
  And I follow "Troisième idée"
  And I wait 5 seconds
  When I follow "Modifier"
  And I fill in the following:
    | body      | Je modifie mon commentaire !   |
  And I press "Modifier"
    Then I should not see "Merci ! Votre commentaire a bien été modifié."
