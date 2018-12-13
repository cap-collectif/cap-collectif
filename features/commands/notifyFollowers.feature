@proposal_follow @proposal_follower_email
Feature: Notify Followers Command

@parallel-scenario
Scenario: "Cron want to notify followers and open an email"
  Given I run "capco:follower-notifier"
  Then the command exit code should be 0
  And 71 mail should be sent
  And I open mail to "lbrunet@jolicode.com"
  And I should see "admin.fields.highlighted_content.project" in mail
  And I should see "Budget Participatif Rennes" in mail
  And I should see "new-activity {&quot;%count%&quot;:3,&quot;%num%&quot;:3}" in mail
  And I should see "admin.fields.source.opinion" in mail
  And I should see "Ravalement de la façade de la bibliothèque municipale" in mail
  And I should see "💬 new-comment" in mail
  And I should see "✔️ moving-to-the-step-with-status {&quot;{titleStep}&quot;:&quot;S\u00e9lection&quot;,&quot;{statusName}&quot;:&quot;Soumis au vote&quot;}" in mail
  And I should see "admin.fields.source.opinion" in mail
  And I should see "Rénovation du gymnase" in mail
  And I should see "✔️ moving-to-the-step-with-status {&quot;{titleStep}&quot;:&quot;S\u00e9lection&quot;,&quot;{statusName}&quot;:&quot;Vote gagn\u00e9&quot;}" in mail
  And I should see "admin.fields.source.opinion" in mail
  And I should see "admin.fields.highlighted_content.project" in mail
  And I should see "Dépot avec selection vote budget" in mail
  And I should see "new-activity {&quot;%count%&quot;:1,&quot;%num%&quot;:1}" in mail
  And I should see "admin.fields.source.opinion" in mail
  And I should see "Proposition pas chère" in mail
  And I should see "✔️ moving-to-the-step {&quot;{titleStep}&quot;:&quot;S\u00e9lection avec vote selon le budget&quot;}" in mail
  And I should see "you-receive-this-email-because" in mail
  And I should see "you-follow-these-proposals" in mail
  And I should see 'set-up-my-subscriptions' in mail
  And I should see 'notification.email.external_footer {"{to}":"lbrunet@jolicode.com","{sitename}":"Cap-Collectif","{business}":"Cap Collectif","{siteUrl}":"https:\/\/capco.dev\/","{businessUrl}":"https:\/\/cap-collectif.com\/"}' in mail
