Feature: Feature Flags Api

  Scenario: API client wants to list features
    When I send a GET request to "/api/features"
    Then the JSON response should match:
    """
    {
      "blog": @boolean@,
      "calendar": @boolean@,
      "newsletter": @boolean@,
      "ideas": @boolean@,
      "themes": @boolean@,
      "registration": @boolean@,
      "login_facebook": @boolean@,
      "login_gplus": @boolean@,
      "login_nous_citoyens": @boolean@,
      "shield_mode": @boolean@,
      "user_type": @boolean@,
      "members_list": @boolean@,
      "projects_form": @boolean@,
      "share_buttons": @boolean@,
      "idea_creation": @boolean@,
      "project_trash": @boolean@,
      "idea_trash": @boolean@,
      "reporting": @boolean@,
      "zipcode_at_register": @boolean@
    }
    """
