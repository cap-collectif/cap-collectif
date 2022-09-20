@civicIA
Feature: Update CivicIA responses

@database
Scenario: Admin update CivicIA data for responses
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateCivicIAInput!) {
      updateCivicIA(input: $input) {
        analyzables {
          iaCategory
          iaReadability
          iaSentiment
        }
        errorCode
      }
    }",
    "variables": {
      "input": {
        "data": "[
          {
            \"value_id\": \"responseTagCloud1\",
            \"lisibilite\": 75.03,
            \"longueur\": 14,
            \"sentiment\": \"NEUTRAL\",
            \"sentiment_score\": {
              \"Positive\": 0.0189564861,
              \"Negative\": 0.0064354725,
              \"Neutral\": 0.9745733738,
              \"Mixed\": 0.0000347175
            },
            \"categories\": \"\/news\",
            \"categories_details\": [
              {\"score\":0.834992,\"label\":\"\/news\"},
              {\"score\":0.663648,\"label\":\"\/automotive and vehicles\/vehicle rental\"},
              {\"score\":0.660499,\"label\":\"\/news\/national news\"}
            ]
          },
          {
            \"value_id\": \"responseTagCloud3\",
            \"lisibilite\": 42,
            \"longueur\": 12,
            \"sentiment\": \"POSITIVE\",
            \"sentiment_score\": {
              \"Positive\": 0.9745733738,
              \"Negative\": 0.0064354725,
              \"Neutral\": 0.0064354725,
              \"Mixed\": 0.0000347175
            },
            \"categories\": \"\/business and industrial\/business operations\/management\/business process\",
            \"categories_details\": [
              {\"score\":0.678294,\"label\":\"\/business and industrial\/business operations\/management\/business process\"},
              {\"score\":0.626611,\"label\":\"\/automotive and vehicles\/vehicle rental\"}
            ]
          }
        ]"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateCivicIA": {
        "analyzables": [
          {
            "iaCategory": "news",
            "iaReadability": 75,
            "iaSentiment": "NEUTRAL"
          },
          {
            "iaCategory": "business and industrial",
            "iaReadability": 42,
            "iaSentiment": "POSITIVE"
          }
        ],
        "errorCode": null
      }
    }
  }
  """