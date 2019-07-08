@questionnaire
Feature: Conditional questionnaire

@database
Scenario: Logged in user wants to fill a conditional questionnaire by going into a specific branch
(Hap ou Noel ? -> Hap and Marvel ou DC -> Marvel) of the questionnaire and should see the correct questions
  Given I am logged in as user
  And I go to a conditional questionnaire step
  Then I should see "Hap ou Noel ?"
  Then I should see "Votre fleuve préféré"
  Then I should not see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  Then I should not see "Par qui Hap a t-il été créé ?"
  Then I should not see "Hap est-il un homme bon ?"
  Then I should not see "Comment ça ce n'est pas un homme bon, comment oses-tu ?"
  Then I should not see "Noel a t-il un rapport avec la fête de Noël ?"
  Then I should not see "De quelle couleur est le chapeau de Noël ?"
  Then I should not see "Plutôt Marvel ou DC ?"
  Then I should not see "T'aimes bien Superman ?"
  Then I should not see "T'aimes bien Batman ?"
  Then I should not see "T'aimes bien Supergirl ?"
  Then I should not see "T'aimes bien Iron Man ?"
  Then I should not see "T'aimes bien Luke Cage ?"
  Then I should not see "T'aimes bien Thor ?"
  Then I should not see "C'est la fin mais j'affiche quand même des choix"
  And I fill in the following:
    | responses[0].value | Hap |
  Then I should see "Par qui Hap a t-il été créé ?"
  And I fill in the following:
    | responses[1].value | Le gange |
  Then I should see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  And I fill in the following:
    | responses[3].value | Cisla |
  Then I should see "Hap est-il un homme bon ?"
  And I fill in the following:
    | responses[4].value | Oui |
  Then I should see "Plutôt Marvel ou DC ?"
  And I fill in the following:
    | responses[8].value | Marvel |
  Then I should see "T'aimes bien Iron Man ?"
  And I fill in the following:
    | responses[12].value | Oui |
  Then I should see "T'aimes bien Luke Cage ?"
  And I fill in the following:
    | responses[13].value | Oui c un bo chauve ténébreux |
  Then I should see "T'aimes bien Thor ?"
  And I fill in the following:
    | responses[14].value | ui |
  Then I should see "C'est la fin mais j'affiche quand même des choix"
  And I reload the page, I should see a confirm popup

@database
Scenario: Logged in user wants to fill a conditional questionnaire by going into a specific branch
(Hap ou Noel ? -> Hap and Marvel ou DC ? -> DC) of the questionnaire and should see the correct questions
  Given I am logged in as user
  And I go to a conditional questionnaire step
  Then I should see "Hap ou Noel ?"
  Then I should see "Votre fleuve préféré"
  Then I should not see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  Then I should not see "Par qui Hap a t-il été créé ?"
  Then I should not see "Hap est-il un homme bon ?"
  Then I should not see "Comment ça ce n'est pas un homme bon, comment oses-tu ?"
  Then I should not see "Noel a t-il un rapport avec la fête de Noël ?"
  Then I should not see "De quelle couleur est le chapeau de Noël ?"
  Then I should not see "Plutôt Marvel ou DC ?"
  Then I should not see "T'aimes bien Superman ?"
  Then I should not see "T'aimes bien Batman ?"
  Then I should not see "T'aimes bien Supergirl ?"
  Then I should not see "T'aimes bien Iron Man ?"
  Then I should not see "T'aimes bien Luke Cage ?"
  Then I should not see "T'aimes bien Thor ?"
  Then I should not see "C'est la fin mais j'affiche quand même des choix"
  And I fill in the following:
    | responses[0].value | Hap |
  Then I should see "Par qui Hap a t-il été créé ?"
  And I fill in the following:
    | responses[1].value | Le gange |
  Then I should see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  And I fill in the following:
    | responses[3].value | Cisla |
  Then I should see "Hap est-il un homme bon ?"
  And I fill in the following:
    | responses[4].value | Oui |
  Then I should see "Plutôt Marvel ou DC ?"
  And I fill in the following:
    | responses[8].value | DC |
  Then I should see "T'aimes bien Superman ?"
  And I fill in the following:
    | responses[9].value | Oui |
  Then I should see "T'aimes bien Batman ?"
  And I fill in the following:
    | responses[10].value | Oui |
  Then I should see "T'aimes bien Supergirl ?"
  And I fill in the following:
    | responses[11].value | Non |
  Then I should see "C'est la fin mais j'affiche quand même des choix"
  And I reload the page, I should see a confirm popup

@database
Scenario: Logged in user wants to fill a conditional questionnaire by going into a specific branch
(Hap ou Noel ? -> Hap and Marvel ou DC ? -> DC) of the questionnaire and then get back to another branch
(Marvel ou DC ? -> Marvel) and should see the correct questions
  Given I am logged in as user
  And I go to a conditional questionnaire step
  Then I should see "Hap ou Noel ?"
  Then I should see "Votre fleuve préféré"
  Then I should not see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  Then I should not see "Par qui Hap a t-il été créé ?"
  Then I should not see "Hap est-il un homme bon ?"
  Then I should not see "Comment ça ce n'est pas un homme bon, comment oses-tu ?"
  Then I should not see "Noel a t-il un rapport avec la fête de Noël ?"
  Then I should not see "De quelle couleur est le chapeau de Noël ?"
  Then I should not see "Plutôt Marvel ou DC ?"
  Then I should not see "T'aimes bien Superman ?"
  Then I should not see "T'aimes bien Batman ?"
  Then I should not see "T'aimes bien Supergirl ?"
  Then I should not see "T'aimes bien Iron Man ?"
  Then I should not see "T'aimes bien Luke Cage ?"
  Then I should not see "T'aimes bien Thor ?"
  Then I should not see "C'est la fin mais j'affiche quand même des choix"
  And I fill in the following:
    | responses[0].value | Hap |
  Then I should see "Par qui Hap a t-il été créé ?"
  And I fill in the following:
    | responses[1].value | Le gange |
  Then I should see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  And I fill in the following:
    | responses[3].value | Cisla |
  Then I should see "Hap est-il un homme bon ?"
  And I fill in the following:
    | responses[4].value | Oui |
  Then I should see "Plutôt Marvel ou DC ?"
  And I fill in the following:
    | responses[8].value | DC |
  Then I should see "T'aimes bien Superman ?"
  And I fill in the following:
    | responses[9].value | Oui |
  Then I should see "T'aimes bien Batman ?"
  And I fill in the following:
    | responses[10].value | Oui |
  Then I should see "T'aimes bien Supergirl ?"
  And I fill in the following:
    | responses[11].value | Non |
  Then I should see "C'est la fin mais j'affiche quand même des choix"
  And I fill in the following:
    | responses[8].value | Marvel |
  Then I should not see "T'aimes bien Superman ?"
  Then I should not see "T'aimes bien Batman ?"
  Then I should not see "T'aimes bien Supergirl ?"
  Then I should not see "C'est la fin mais j'affiche quand même des choix"
  Then I should see "T'aimes bien Iron Man ?"
  And I fill in the following:
    | responses[12].value | Oui |
  Then I should see "T'aimes bien Luke Cage ?"
  And I fill in the following:
    | responses[13].value | Oui c un bo chauve ténébreux |
  Then I should see "T'aimes bien Thor ?"
  And I fill in the following:
    | responses[14].value | ui |
  Then I should see "C'est la fin mais j'affiche quand même des choix"
  And I reload the page, I should see a confirm popup

@database
Scenario: Logged in user wants to fill a conditional questionnaire by going into a specific branch
(Hap ou Noel ? -> Hap and Marvel ou DC ? -> Marvel) of the questionnaire and then get back to another branch
(Marvel ou DC ? -> DC) and should see the correct questions
  Given I am logged in as user
  And I go to a conditional questionnaire step
  Then I should see "Hap ou Noel ?"
  Then I should see "Votre fleuve préféré"
  Then I should not see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  Then I should not see "Par qui Hap a t-il été créé ?"
  Then I should not see "Hap est-il un homme bon ?"
  Then I should not see "Comment ça ce n'est pas un homme bon, comment oses-tu ?"
  Then I should not see "Noel a t-il un rapport avec la fête de Noël ?"
  Then I should not see "De quelle couleur est le chapeau de Noël ?"
  Then I should not see "Plutôt Marvel ou DC ?"
  Then I should not see "T'aimes bien Superman ?"
  Then I should not see "T'aimes bien Batman ?"
  Then I should not see "T'aimes bien Supergirl ?"
  Then I should not see "T'aimes bien Iron Man ?"
  Then I should not see "T'aimes bien Luke Cage ?"
  Then I should not see "T'aimes bien Thor ?"
  Then I should not see "C'est la fin mais j'affiche quand même des choix"
  And I fill in the following:
    | responses[0].value | Hap |
  Then I should see "Par qui Hap a t-il été créé ?"
  And I fill in the following:
    | responses[1].value | Le gange |
  Then I should see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  And I fill in the following:
    | responses[3].value | Cisla |
  Then I should see "Hap est-il un homme bon ?"
  And I fill in the following:
    | responses[4].value | Oui |
  Then I should see "Plutôt Marvel ou DC ?"
  And I fill in the following:
    | responses[8].value | Marvel |
  Then I should see "T'aimes bien Iron Man ?"
  And I fill in the following:
    | responses[12].value | Oui |
  Then I should see "T'aimes bien Luke Cage ?"
  And I fill in the following:
    | responses[13].value | Oui c un bo chauve ténébreux |
  Then I should see "T'aimes bien Thor ?"
  And I fill in the following:
    | responses[14].value | ui |
  Then I should see "C'est la fin mais j'affiche quand même des choix"
  And I fill in the following:
    | responses[8].value | DC |
  Then I should not see "T'aimes bien Iron Man ?"
  Then I should not see "T'aimes bien Luke Cage ?"
  Then I should not see "T'aimes bien Thor ?"
  Then I should not see "C'est la fin mais j'affiche quand même des choix"
  Then I should see "T'aimes bien Superman ?"
  And I fill in the following:
    | responses[9].value | Oui |
  Then I should see "T'aimes bien Batman ?"
  And I fill in the following:
    | responses[10].value | Oui |
  Then I should see "T'aimes bien Supergirl ?"
  And I fill in the following:
    | responses[11].value | Non |
  Then I should see "C'est la fin mais j'affiche quand même des choix"
  And I reload the page, I should see a confirm popup

@database
Scenario: Logged in user wants to fill a conditional questionnaire by going into a specific branch
(Hap est-il un homme bon ? -> Non) within another branch
(Hap ou Noel ? -> Hap) and should see the correct questions
  Given I am logged in as user
  And I go to a conditional questionnaire step
  Then I should see "Hap ou Noel ?"
  Then I should see "Votre fleuve préféré"
  Then I should not see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  Then I should not see "Par qui Hap a t-il été créé ?"
  Then I should not see "Hap est-il un homme bon ?"
  Then I should not see "Comment ça ce n'est pas un homme bon, comment oses-tu ?"
  Then I should not see "Noel a t-il un rapport avec la fête de Noël ?"
  Then I should not see "De quelle couleur est le chapeau de Noël ?"
  Then I should not see "Plutôt Marvel ou DC ?"
  Then I should not see "T'aimes bien Superman ?"
  Then I should not see "T'aimes bien Batman ?"
  Then I should not see "T'aimes bien Supergirl ?"
  Then I should not see "T'aimes bien Iron Man ?"
  Then I should not see "T'aimes bien Luke Cage ?"
  Then I should not see "T'aimes bien Thor ?"
  Then I should not see "C'est la fin mais j'affiche quand même des choix"
  And I fill in the following:
    | responses[0].value | Hap |
  Then I should see "Par qui Hap a t-il été créé ?"
  And I fill in the following:
    | responses[1].value | Le gange |
  Then I should see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  And I fill in the following:
    | responses[3].value | Cisla |
  Then I should see "Hap est-il un homme bon ?"
  And I fill in the following:
    | responses[4].value | Non |
  Then I should see "Comment ça ce n'est pas un homme bon, comment oses-tu ?"
  And I reload the page, I should see a confirm popup

@database
Scenario: Logged in user wants to fill a conditional questionnaire by going into a specific branch
(Hap ou Noel ? -> Hap and Marvel ou DC ? -> Marvel) of the questionnaire and then get back to another branch
(Hap ou Noel ? -> Noel) and should see the correct questions
  Given I am logged in as user
  And I go to a conditional questionnaire step
  Then I should see "Hap ou Noel ?"
  Then I should see "Votre fleuve préféré"
  Then I should not see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  Then I should not see "Par qui Hap a t-il été créé ?"
  Then I should not see "Hap est-il un homme bon ?"
  Then I should not see "Comment ça ce n'est pas un homme bon, comment oses-tu ?"
  Then I should not see "Noel a t-il un rapport avec la fête de Noël ?"
  Then I should not see "De quelle couleur est le chapeau de Noël ?"
  Then I should not see "Plutôt Marvel ou DC ?"
  Then I should not see "T'aimes bien Superman ?"
  Then I should not see "T'aimes bien Batman ?"
  Then I should not see "T'aimes bien Supergirl ?"
  Then I should not see "T'aimes bien Iron Man ?"
  Then I should not see "T'aimes bien Luke Cage ?"
  Then I should not see "T'aimes bien Thor ?"
  Then I should not see "C'est la fin mais j'affiche quand même des choix"
  And I fill in the following:
    | responses[0].value | Hap |
  Then I should see "Par qui Hap a t-il été créé ?"
  And I fill in the following:
    | responses[1].value | Le gange |
  Then I should see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  And I fill in the following:
    | responses[3].value | Cisla |
  Then I should see "Hap est-il un homme bon ?"
  And I fill in the following:
    | responses[4].value | Oui |
  Then I should see "Plutôt Marvel ou DC ?"
  And I fill in the following:
    | responses[8].value | Marvel |
  Then I should see "T'aimes bien Iron Man ?"
  And I fill in the following:
    | responses[12].value | Oui |
  Then I should see "T'aimes bien Luke Cage ?"
  And I fill in the following:
    | responses[13].value | Oui c un bo chauve ténébreux |
  Then I should see "T'aimes bien Thor ?"
  And I fill in the following:
    | responses[14].value | ui |
  Then I should see "C'est la fin mais j'affiche quand même des choix"
  And I fill in the following:
    | responses[0].value | Noel |
  Then I should not see "Par qui Hap a t-il été créé ?"
  Then I should not see "Comme tu as choisi Hap et le Gange, je t'affiche cette question (dsl jui pas inspiré)"
  Then I should not see "Hap est-il un homme bon ?"
  Then I should not see "Plutôt Marvel ou DC ?"
  Then I should not see "T'aimes bien Iron Man ?"
  Then I should not see "T'aimes bien Luke Cage ?"
  Then I should not see "T'aimes bien Thor ?"
  Then I should not see "C'est la fin mais j'affiche quand même des choix"
  Then I should see "Noel a t-il un rapport avec la fête de Noël ?"
  And I reload the page, I should see a confirm popup
