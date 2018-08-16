@availableDistrictsForLocalisation
Feature: availableDistrictsForLocalisation

Scenario: GraphQL client wants to get list of available districts for a particular location
  Given I send a GraphQL request:
  """
  {
    availableDistrictsForLocalisation (proposalFormId: "proposalForm1", latitude: 48.1159675, longitude: -1.7234738) {
      name
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "availableDistrictsForLocalisation": [
        {
          "name": "La Touche"
        },
        {
          "name": "Rennes"
        }
      ]
    }
  }
  """

Scenario: GraphQL client wants to get list of available districts for an invalid location
  Given I send a GraphQL request:
"""
{
  availableDistrictsForLocalisation (proposalFormId: "proposalForm1", latitude: 32.1159675, longitude: -13.7234738) {
    name
  }
}
"""
  Then the JSON response should match:
"""
{
  "data": {
    "availableDistrictsForLocalisation": []
  }
}
"""
