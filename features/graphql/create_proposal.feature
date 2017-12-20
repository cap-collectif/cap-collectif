@proposal @create_proposal
Feature: Create Proposal

@database @elasticsearch
Scenario: GraphQL client wants to add creare a draft proposal
  Given features themes, districts are enabled
  And I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalInput!) {
      createProposal(input: $input) {
        proposal {
          id
          title
          publicationStatus
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm1",
        "draft": true,
        "title": "Acheter un sauna pour Capco"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createProposal": {
        "proposal": {
          "id": @string@,
          "title": "Acheter un sauna pour Capco",
          "publicationStatus": "DRAFT"
        }
      }
    }
  }
  """

@database @elasticsearch
Scenario: GraphQL client wants to create a proposal
  Given features themes, districts are enabled
  And I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalInput!) {
      createProposal(input: $input) {
        proposal {
          id
          title
          publicationStatus
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm1",
        "draft": false,
        "title": "Acheter un sauna pour Capco",
        "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
        "theme": "theme1",
        "district": "district1",
        "category": "pCategory1",
        "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
        "responses": [
          {
            "question": "1",
            "value": ""
          },
          {
            "question": "3",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "11",
            "medias": ["media10"]
          },
          {
            "question": "12",
            "medias": ["media10"]
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createProposal": {
        "proposal": {
          "id": @string@,
          "title": "Acheter un sauna pour Capco",
          "publicationStatus": "PUBLISHED"
        }
      }
    }
  }
  """

# Scenario: Logged in admin API client wants to add a proposal with fusion
#   Given I am logged in to api as admin
#   Given feature themes is enabled
#   Given feature districts is enabled
#   When I send a POST request to "/api/proposal_forms/proposalForm1/proposals" with json:
#   """
#   {
#     "author": "user2",
#     "childConnections": ["proposal1", "proposal2"],
#     "title": "Acheter un sauna pour Capco",
#     "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
#     "theme": "theme1",
#     "district": "district1",
#     "category": "pCategory1",
#     "responses": [
#       {
#         "question": 1,
#         "value": ""
#       },
#       {
#         "question": 3,
#         "value": "Réponse à la question obligatoire"
#       }
#     ]
#   }
#   """
#   Then the JSON response status code should be 201
#   And proposal "proposal1" should be fusioned to the last inserted proposal
#   And proposal "proposal2" should be fusioned to the last inserted proposal
#   And the last inserted proposal should have author "sfavot"

@security
Scenario: GraphQL client wants to create a proposal out of the zone
  Given features themes, districts are enabled
  And I am logged in to graphql as user
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalInput!) {
      createProposal(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm1",
        "title": "Acheter un sauna pour Capco",
        "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
        "theme": "theme1",
        "district": "district1",
        "category": "pCategory1",
        "address": "[{\"address_components\":[{\"long_name\":\"18\",\"short_name\":\"18\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Parmentier\",\"short_name\":\"Avenue Parmentier\",\"types\":[\"route\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"\u00CEle-de-France\",\"short_name\":\"\u00CEle-de-France\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"75011\",\"short_name\":\"75011\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"18 Avenue Parmentier, 75011 Paris, France\",\"geometry\":{\"location\":{\"lat\":48.8599104,\"lng\":2.3791948},\"location_type\":\"ROOFTOP\",\"viewport\":{\"northeast\":{\"lat\":48.8612593802915,\"lng\":2.380543780291502},\"southwest\":{\"lat\":48.8585614197085,\"lng\":2.377845819708498}}},\"place_id\":\"ChIJC5NyT_dt5kcRq3u4vOAhdQs\",\"types\":[\"street_address\"]}]",
        "responses": [
          {
            "question": "1",
            "value": ""
          },
          {
            "question": "3",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "11",
            "medias": ["media10"]
          },
          {
            "question": "12",
            "medias": ["media10"]
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"global.address_not_in_zone","locations":[{"line":1,"column":46}]}],"data":{"createProposal":null}}
  """

@security
Scenario: Logged in API client wants to add a proposal without a required response
  Given I am logged in to graphql as user
  Given features themes, districts are enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalInput!) {
      createProposal(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm1",
        "title": "Acheter un sauna pour Capco",
        "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
        "theme": "theme1",
        "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
        "district": "district1",
        "category": "pCategory1",
        "responses": [
          {
            "question": "1",
            "value": "Oups j'ai oublié la réponse à la question 3"
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"proposal.missing_required_responses","locations":[{"line":1,"column":46}]}],"data":{"createProposal":null}}
  """

@security
Scenario: Logged in API client wants to add a proposal with empty required response
  Given I am logged in to graphql as user
  Given features themes, districts are enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalInput!) {
      createProposal(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm1",
        "title": "Acheter un sauna pour Capco",
        "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
        "theme": "theme1",
        "district": "district1",
        "category": "pCategory1",
        "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
        "responses": [
          {
            "question": "1",
            "value": "Oups j'ai oublié la réponse à la question 3"
          },
          {
            "question": "3",
            "value": ""
          },
          {
            "question": "11",
            "medias": ["media10"]
          },
          {
            "question": "12",
            "medias": ["media10"]
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"proposal.missing_required_responses","locations":[{"line":1,"column":46}]}],"data":{"createProposal":null}}
  """

@security
Scenario: Logged in API client wants to add a proposal with no category when mandatory
  Given I am logged in to graphql as user
  And features themes, districts are enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalInput!) {
      createProposal(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm1",
        "title": "Acheter un sauna pour Capco",
        "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
        "theme": "theme1",
        "district": "district1",
        "address": "[{\"address_components\":[{\"long_name\":\"262\",\"short_name\":\"262\",\"types\":[\"street_number\"]},{\"long_name\":\"Avenue Général Leclerc\",\"short_name\":\"Avenue Général Leclerc\",\"types\":[\"route\"]},{\"long_name\":\"Rennes\",\"short_name\":\"Rennes\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Ille-et-Vilaine\",\"short_name\":\"Ille-et-Vilaine\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Bretagne\",\"short_name\":\"Bretagne\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"35700\",\"short_name\":\"35700\",\"types\":[\"postal_code\"]}],\"formatted_address\":\"262 Avenue Général Leclerc, 35700 Rennes, France\",\"geometry\":{\"bounds\":{\"northeast\":{\"lat\":48.1140978,\"lng\":-1.6404985},\"southwest\":{\"lat\":48.1140852,\"lng\":-1.640499}},\"location\":{\"lat\":48.1140852,\"lng\":-1.6404985},\"location_type\":\"RANGE_INTERPOLATED\",\"viewport\":{\"northeast\":{\"lat\":48.1154404802915,\"lng\":-1.639149769708498},\"southwest\":{\"lat\":48.1127425197085,\"lng\":-1.641847730291502}}},\"place_id\":\"EjIyNjIgQXZlbnVlIEfDqW7DqXJhbCBMZWNsZXJjLCAzNTcwMCBSZW5uZXMsIEZyYW5jZQ\",\"types\":[\"street_address\"]}]",
        "responses": [
          {
            "question": "1",
            "value": ""
          },
          {
            "question": "3",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "11",
            "medias": ["media10"]
          },
          {
            "question": "12",
            "medias": ["media10"]
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"global.no_category_when_mandatory","locations":[{"line":1,"column":46}]}],"data":{"createProposal":null}}
  """

@security
Scenario: Logged in API client wants to add a proposal with no address when mandatory
  Given I am logged in to graphql as user
  And features themes, districts are enabled
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalInput!) {
      createProposal(input: $input) {
        proposal {
          id
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm1",
        "title": "Acheter un sauna pour Capco",
        "body": "Avec tout le travail accompli, on mérite bien un (petit) cadeau, donc on a choisi un sauna. Attention JoliCode ne sera accepté que sur invitation !",
        "theme": "theme1",
        "district": "district1",
        "category": "pCategory1",
        "responses": [
          {
            "question": "1",
            "value": ""
          },
          {
            "question": "3",
            "value": "Réponse à la question obligatoire"
          },
          {
            "question": "11",
            "medias": ["media10"]
          },
          {
            "question": "12",
            "medias": ["media10"]
          }
        ]
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"errors":[{"message":"global.no_address_when_mandatory","locations":[{"line":1,"column":46}]}],"data":{"createProposal":null}}
  """
