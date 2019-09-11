@opinions @sections @read-only
Feature: Sections

Scenario: GraphQL client wants to list sections
  Given I send a GraphQL POST request:
  """
  {
    "query": "{
        sections {
          id
        }
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "sections": [
        {"id": "opinionType1"},
        {"id": "opinionType10"},
        {"id": "opinionType11"},
        {"id": "opinionType12"},
        {"id": "opinionType13"},
        {"id": "opinionType17"},
        {"id": "opinionType18"},
        {"id": "opinionType19"},
        {"id": "opinionType2"},
        {"id": "opinionType20"},
        {"id": "opinionType21"},
        {"id": "opinionType22"},
        {"id": "opinionType23"},
        {"id": "opinionType24"},
        {"id": "opinionType25"},
        {"id": "opinionType26"},
        {"id": "opinionType27"},
        {"id": "opinionType28"},
        {"id": "opinionType28ter"},
        {"id": "opinionType29"},
        {"id": "opinionType29ter"},
        {"id": "opinionType3"},
        {"id": "opinionType4"},
        {"id": "opinionType5"},
        {"id": "opinionType5bis"},
        {"id": "opinionType5ter"},
        {"id": "opinionType6"},
        {"id": "opinionType7"},
        {"id": "opinionType8"},
        {"id": "opinionType9"},
        {"id": "opinionTypeEndless"},
        {"id":"opinionTypeCustomAccess"},
        {"id":"opinionTypePrivate"}
        {"id": "opinionTypeFirstInFirstConsultationM"},
        {"id": "opinionTypeFirstInSecondConsultation"},
        {"id": "opinionTypeSecondInFirstConsultation"},
        {"id": "opinionTypeSecondInSecondConsultatio"}
      ]
    }
  }
  """

Scenario: GraphQL client wants to list sections by user
  Given I send a GraphQL POST request:
  """
  {
    "query": "query sections($user: ID!){
      sections(user: $user ) {
          id
        }
    }",
    "variables": {
      "user": "VXNlcjp1c2VyNQ=="
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "sections": [
        {"id": "opinionType5"},
        {"id": "opinionType8"},
        {"id": "opinionTypeFirstInFirstConsultationM"},
        {"id": "opinionType6"},
        {"id": "opinionType12"},
        {"id": "opinionTypeSecondInFirstConsultation"},
        {"id": "opinionType10"}
      ]
    }
  }
  """

