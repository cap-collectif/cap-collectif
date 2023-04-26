@consumers
Feature: Emailing campaign consumer

@rabbitmq @snapshot-email
Scenario: Send an email to a user group
  Given I publish in "emailing_campaign" with message below:
  """
  {
    "emailingCampaignId": "CampaignToAgentDeLaVilleParticipants"
  }
  """
  And I consume 1 messages in "emailing_campaign"
  Then I open mail to 'lbrunet@cap-collectif.com'
  And email should match snapshot "CampaignToAgentDeLaVilleParticipants.html"

@rabbitmq
Scenario: Only send email to recipient who did not receive it
  Given I publish in "emailing_campaign" with message below:
  """
  {
    "emailingCampaignId": "CampaignToCovidParticipants"
  }
  """
  And I consume 1 messages in "emailing_campaign"
  Then 1 mail should be sent