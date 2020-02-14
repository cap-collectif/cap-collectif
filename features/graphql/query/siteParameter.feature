@siteParameter
Feature: SiteParameter

Scenario: GraphQL client wants to get a translated siteparameter
  Given I am logged in to graphql as admin
  Given I send a GraphQL request:
  """
  {
    siteParameter (keyname: "contact.title") {
      keyname
      value
      isTranslatable
      translations {
        value
        locale
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "siteParameter":{
        "keyname":"contact.title",
        "value":"Contact",
        "isTranslatable":true,
        "translations":[
          {
            "value":"Contact",
            "locale":"fr-FR"
          }
        ]
      }
    }
  }
  """

Scenario: GraphQL client wants to get a non-translatable siteparameter
  Given I am logged in to graphql as admin
  Given I send a GraphQL request:
  """
  {
    siteParameter (keyname: "global.timezone") {
      keyname
      value
      isTranslatable
      translations {
        value
        locale
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "siteParameter":{
        "keyname":"global.timezone",
        "value":"Europe/Paris",
        "isTranslatable":false,
        "translations":[]
      }
    }
  }
  """

Scenario: GraphQL client wants to get a non-existent siteparameter
  Given I am logged in to graphql as admin
  Given I send a GraphQL request:
  """
  {
    siteParameter (keyname: "i.wish.i.exist") {
      keyname
      value
      isTranslatable
      translations {
        value
        locale
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data":{
      "siteParameter": null
    }
  }
  """
