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
      "data": {
        "contactForms": [
          {
            "email": "admin1@email.com",
            "title": "Contact form 1",
            "body": "<p>This is a contact form body</p>"
          },
          {
            "email": "admin2@email.com",
            "title": "Contact form 2",
            "body": "<p>This is another contact form body</p>"
          },
          {
            "email": "assistance@cap-collectif.com",
            "title": "Formulaire de contact avec confidentiality null",
            "body": "<p></p>"
          }
        ]
      }
    }
  """
