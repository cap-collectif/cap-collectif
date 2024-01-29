@consumers
Feature: Project district consumers

@rabbitmq @snapshot-email
Scenario: A new project is refer in a district; Follower receive an notification email
  Given I publish in "project_district_notification" with message below:
  """
  {
   "projectId": "project2",
   "globalDistrict": "globalDistrict7"
  }
  """
  When I consume "project_district_notification"
  Then I open mail with subject 'new-project-in-district {"siteName":"Cap-Collectif"}' from "assistance@cap-collectif.com" to "maxime.auriau@cap-collectif.com"
  And email should match snapshot 'projectDistrictNotification.html'