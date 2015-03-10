Feature: Ideas

Scenario: Can see no ideas in empty theme
  Given feature "themes" is enabled
  And feature "ideas" is enabled
  And I visited themespage
  When I follow "Thème vide"
  Then I should see "Il n'y a aucune idée pour le moment."
  And I should see 0 ".media--macro" elements

Scenario: Can see ideas in not empty theme
  Given feature "themes" is enabled
  And feature "ideas" is enabled
  And I visited themespage
  When I follow "Immobilier"
  Then I should not see "Il n'y a aucune idée pour le moment."
  And I should see 3 ".media--macro" elements

Scenario: Can create an idea when logged in
  Given feature "ideas" is enabled
  And I am logged in as user
  And I visited ideaspage
  And I follow "Proposer une idée"
  And I fill in the following:
    | capco_appbundle_idea_title     | Titre                     |
    | capco_appbundle_idea_body      | Description de mon idée   |
  And I select "Immobilier" from "capco_appbundle_idea_Theme"
    | capco_appbundle_idea_Theme     | Immobilier                |
  And I press "Publier"
  Then I should see "Merci ! Votre idée a bien été enregistrée."

Scenario: Can not create an idea when not logged in
  Given feature "ideas" is enabled
  And I follow "Boîte à idées"
  And I follow "Proposer une idée"
  Then I should see "Se connecter"


