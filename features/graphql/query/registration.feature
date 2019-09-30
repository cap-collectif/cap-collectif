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
      "registrationScript": "<script> console.log('Facebook pixel - activated'); !function(f,b,e,v,n,t,s) {if(f.fbq)return;n=f.fbq=function(){n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)}; if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0'; n.queue=[];t=b.createElement(e);t.async=!0; t.src=v;s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s)}(window, document,'script', 'https://connect.facebook.net/en_US/fbevents.js'); fbq('init', '1133038790219319'); fbq('track', 'CompleteRegistration'); </script> <noscript><img height='1' width='1' style='display:none' src='https://www.facebook.com/tr?id=1133038790219319&ev=PageView&noscript=1' /></noscript>"
    }
  }
  """
