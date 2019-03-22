@contact @read-only
Feature: Contact

Scenario: GraphQL client wants to list contact forms
  Given I send a GraphQL POST request:
  """
  {
    "query": "{
        contactForms {
          email
          title
          body
        }
    }"
  }
  """
  Then the JSON response should match:
  """
    {
      "data":{
        "contactForms":[
          {"email":"admin1@email.com","title":"Contact form 1","body":"\u003Cp\u003EThis is a contact form body\u003C\/p\u003E"},
          {"email":"admin2@email.com","title":"Contact form 2","body":"\u003Cp\u003EThis is another contact form body\u003C\/p\u003E"}
        ]
      }
    }
  """