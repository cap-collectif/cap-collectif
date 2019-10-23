@reviewEvent @event
Feature: Review Event

@database
Scenario: Admin approved an event in awaiting status
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: ReviewEventInput!) {
      reviewEvent(input: $input) {
        event {
          _id
          review {
            createdAt
            updatedAt
            status
            reviewer {
              _id
            }
            refusedReason
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RXZlbnQ6ZXZlbnRDcmVhdGVCeUFVc2VyUmV2aWV3QXdhaXRpbmc=",
        "status": "APPROVED"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "reviewEvent":{
           "event":{
              "_id":"eventCreateByAUserReviewAwaiting",
              "review":{
                 "createdAt":"2015-01-14 00:00:00",
                 "updatedAt":"@string@.isDateTime()",
                 "status":"APPROVED",
                 "reviewer":{
                    "_id":"userAdmin"
                 },
                 "refusedReason":"NONE"
              }
           }
        }
     }
  }
  """

@database
Scenario: Admin refused an event in awaiting status
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: ReviewEventInput!) {
      reviewEvent(input: $input) {
        event {
          _id
          review {
            createdAt
            updatedAt
            status
            reviewer {
              _id
            }
            comment
            refusedReason
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RXZlbnQ6ZXZlbnRDcmVhdGVCeUFVc2VyUmV2aWV3QXdhaXRpbmc=",
        "status": "REFUSED",
        "refusedReason": "SPAM",
        "comment": "On se calme sur le SPAM, merci."
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "reviewEvent":{
           "event":{
              "_id":"eventCreateByAUserReviewAwaiting",
              "review":{
                 "createdAt":"2015-01-14 00:00:00",
                 "updatedAt":"2019-10-22 18:24:37",
                 "status":"REFUSED",
                 "reviewer":{
                    "_id":"userAdmin"
                 },
                 "comment": "On se calme sur le SPAM, merci.",
                 "refusedReason":"SPAM"
              }
           }
        }
     }
  }
  """

@database
Scenario: Admin try to review an event ever approved
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: ReviewEventInput!) {
      reviewEvent(input: $input) {
        event {
          _id
          review {
            createdAt
            updatedAt
            status
            reviewer {
              _id
            }
            comment
            refusedReason
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RXZlbnQ6ZXZlbnRDcmVhdGVCeUFVc2VyUmV2aWV3QXBwcm92ZWQ=",
        "status": "REFUSED",
        "refusedReason": "SPAM",
        "comment": "On se calme sur le SPAM, merci."
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"reviewEvent":{"event":null}}}
  """

@database
Scenario: SuperAdmin change review of event ever approved
  Given I am logged in to graphql as super admin
  And I send a GraphQL POST request:
   """
   {
    "query": "mutation ($input: ReviewEventInput!) {
      reviewEvent(input: $input) {
        event {
          _id
          review {
            createdAt
            updatedAt
            status
            reviewer {
              _id
            }
            comment
            refusedReason
          }
        }
      }
    }",
    "variables": {
      "input": {
        "id": "RXZlbnQ6ZXZlbnRDcmVhdGVCeUFVc2VyUmV2aWV3QXBwcm92ZWQ=",
        "status": "REFUSED",
        "refusedReason": "SPAM",
        "comment": "On se calme sur le SPAM, merci."
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
     "data":{
        "reviewEvent":{
           "event":{
              "_id":"eventCreateByAUserReviewApproved",
              "review":{
                 "createdAt":"2015-04-14 00:00:00",
                 "updatedAt":"2019-10-22 18:24:37",
                 "status":"REFUSED",
                 "reviewer":{
                    "_id":"user2"
                 },
                 "comment":"On se calme sur le SPAM, merci.",
                 "refusedReason":"SPAM"
              }
           }
        }
     }
  }
  """
