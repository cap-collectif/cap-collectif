@registration
Feature: Registration

@database
Scenario: GraphQL admin wants to update registration page code
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "query getRegistrationScript{
      registrationScript
    }"
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "registrationScript": "<script>if(typeof fbq !== 'undefined'){fbq('track', 'CompleteRegistration');}console.log('Facebook pixel - activated'); </script><noscript><img height='1' width='1' style='display:none' src='https://www.facebook.com/tr?id=1133038790219319&ev=PageView&noscript=1' /></noscript>"
    }
  }
  """
