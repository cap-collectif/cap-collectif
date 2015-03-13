Feature: Ideas

Scenario: Can see no ideas in empty theme
  Given feature "themes" is enabled
  And feature "ideas" is enabled
  And I visited "themes page"
  When I follow "Thème vide"
  Then I should see "Il n'y a aucune idée pour le moment."
  And I should see 0 ".media--macro" elements

Scenario: Can see ideas in not empty theme
  Given feature "themes" is enabled
  And feature "ideas" is enabled
  And I visited "themes page"
  When I follow "Immobilier"
  Then I should not see "Il n'y a aucune idée pour le moment."
  And I should see 4 ".media--macro" elements

Scenario: Can create an idea when logged in
  Given feature "themes" is enabled
  And feature "ideas" is enabled
  And I am logged in as user
  And I visited "ideas page"
  When I follow "Proposer une idée"
  And I fill in the following:
    | capco_appbundle_idea_title     | Titre                     |
    | capco_appbundle_idea_body      | Description de mon idée   |
  And I select "Immobilier" from "capco_appbundle_idea_Theme"
  And I press "Publier"
  Then I should see "Merci ! Votre idée a bien été enregistrée."

Scenario: Can not create an idea when not logged in
  Given feature "ideas" is enabled
  And I visited "ideas page"
  When I follow "Proposer une idée"
  Then I should see "Connexion"

Scenario: Can comment an idea
  Given feature "ideas" is enabled
  And I visited "ideas page"
  And I follow "ideaNotCommentable"
  Then I should not see "Commenter"

Scenario: Can not comment an uncommentable idea
  Given feature "ideas" is enabled
  And I visited "ideas page"
  And I follow "ideaCommentable"
  And I should see "Commenter avec mon compte"
  And I fill in the following:
    | capco_app_comment[authorName]  | Naruto              |
    | capco_app_comment[authorEmail] | naruto72@gmail.com  |
    | capco_app_comment[body]        | J'ai un truc à dire |
  When I press "Commenter"
  Then I should see "Merci ! Votre commentaire a bien été enregistré."
  And I should see "J'ai un truc à dire" in the ".opinion__list" element
