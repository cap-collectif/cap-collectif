Feature: Check user's connections
#
#@read-only
#Scenario: user wants to see his connection logs
#  Given I am logged in to graphql as user
#  When I send a GraphQL POST request:
#  """
#  {
#    "query": "query showUserConnection($userId: String){
#      connectionAttempt(userId: $userId){
#        edges{
#          node{
#            userId
#            ipAddress
#            datetime
#            email
#          }
#        }
#      }
#    }",
#    "variables": {
#      "userId": "VXNlcjp1c2VyMQ=="
#    }
#  }
#  """
#  Then the JSON response should match:
#  """
#  {
#    "data": {
#      "connectionAttempt": {
#        "edges": [
#          {
#            "node": {
#              "userId": "VXNlcjp1c2VyMQ==",
#              "ipAddress": "192.168.64.1",
#              "datetime": "2019-08-29 12:11:55",
#              "email": "lbrunet@jolicode.com"
#            }
#          },
#          {
#            "node": {
#              "userId": "VXNlcjp1c2VyMQ==",
#              "ipAddress": "192.168.64.1",
#              "datetime": "2019-08-29 16:16:08",
#              "email": "lbrunet@jolicode.com"
#            }
#          }
#        ]
#      }
#    }
#  }
#  """
