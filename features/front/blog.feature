Feature: News
  
Scenario: Can comment a news
  Given feature "blog" is enabled
  And I visited "blog page"
  And I follow "Post 2"
  And I should see "Commenter avec mon compte"
  And I fill in the following:
    | capco_app_comment[authorName]  | Naruto              |
    | capco_app_comment[authorEmail] | naruto72@gmail.com  |
    | capco_app_comment[body]        | J'ai un truc à dire |
  When I press "Commenter"
  Then I should see "Merci ! Votre commentaire a bien été enregistré."
  And I should see "J'ai un truc à dire" in the ".opinion__list" element
