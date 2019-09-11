@contact
Feature: addContactForm

@database
Scenario: GraphQL client wants to update a group
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: AddContactFormInput!) {
      addContactForm(input: $input) {
        contactForm {
          email
          interlocutor
          title
          body
        }
      }
    }",
    "variables": {
      "input": {
        "title": "This is not a title",
        "interlocutor": "Cap Collectif",
        "body": "holalala ca marche pas votre site c'est vraiment nul pourquoi vous etes nul en plus c'est pas open source en plus vous utilisez du javascript c'est pas francais comme technologie et mon chat vient de vomir et ma contribution n'a pas eu 15.000 j'aime et puis j'aime pas la démocratie c'est trop mainstream.",
        "email": "admin1@admin.fr"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "addContactForm":{
        "contactForm": {
          "email":"admin1@admin.fr",
          "interlocutor": "Cap Collectif",
          "title":"This is not a title",
          "body":"holalala ca marche pas votre site c\u0027est vraiment nul pourquoi vous etes nul en plus c\u0027est pas open source en plus vous utilisez du javascript c\u0027est pas francais comme technologie et mon chat vient de vomir et ma contribution n\u0027a pas eu 15.000 j\u0027aime et puis j\u0027aime pas la d\u00e9mocratie c\u0027est trop mainstream."
        }
      }
    }
  }
  """
