@proposal_form
Feature: Proposal Forms

@database
Scenario: GraphQL client wants to create a proposal form
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: CreateProposalFormInput!) {
      createProposalForm(input: $input) {
        proposalForm {
          id
          title
        }
      }
    }",
    "variables": {
      "input": {
        "title": "Cliquer"
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "createProposalForm": {
        "proposalForm": {
          "id": @string@,
          "title": "Cliquer"
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to update a proposal form
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
      updateProposalForm(input: $input) {
        proposalForm {
          id
          title
          titleHelpText
          description
          descriptionHelpText
          summaryHelpText
          illustrationHelpText
          usingThemes
          themeMandatory
          themeHelpText
          usingDistrict
          districtMandatory
          districtHelpText
          usingCategories
          categoryMandatory
          categoryHelpText
          usingAddress
          addressHelpText
          proposalInAZoneRequired
          latMap
          lngMap
          zoomMap
          commentable
          costable
          categories {
            id
            name
          }
          districts {
            id
            name
          }
          questions {
            id
            position
            helpText
            private
            required
            title
            type
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm1",
        "title": "New title",
        "titleHelpText": "Title help",
        "description": "New description",
        "descriptionHelpText": "Description help",
        "summaryHelpText": "Summary Help",
        "illustrationHelpText": "Illustration Help",
        "usingThemes": true,
        "themeMandatory": true,
        "themeHelpText": "Theme Help",
        "usingDistrict": true,
        "districtMandatory": true,
        "districtHelpText": "District Help",
        "usingCategories": true,
        "categoryMandatory": true,
        "proposalInAZoneRequired": true,
        "categoryHelpText": "Category Help",
        "usingAddress": true,
        "addressHelpText": "Address help",
        "latMap": 0.0,
        "lngMap": 0.0,
        "zoomMap": 0,
        "commentable": true,
        "costable": true,
        "categories": [
          {
            "name": "Aménagement"
          },
          {
            "name": "Politique"
          },
          {
            "name": "New category"
          }
        ],
        "districts": [
          {
            "name": "Beauregard",
            "displayedOnMap": false,
            "geojson": ""
          },
          {
            "name": "Other district",
            "displayedOnMap": true,
            "geojson": ""
          }
        ],
        "questions": []
      }
    }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "updateProposalForm": {
        "proposalForm": {
          "id": "proposalForm1",
          "title": "New title",
          "titleHelpText": "Title help",
          "description": "New description",
          "descriptionHelpText": "Description help",
          "summaryHelpText": "Summary Help",
          "illustrationHelpText": "Illustration Help",
          "usingThemes": true,
          "themeMandatory": true,
          "themeHelpText": "Theme Help",
          "usingDistrict": true,
          "districtMandatory": true,
          "districtHelpText": "District Help",
          "usingCategories": true,
          "categoryMandatory": true,
          "proposalInAZoneRequired": true,
          "categoryHelpText": "Category Help",
          "usingAddress": true,
          "addressHelpText": "Address help",
          "latMap": 0,
          "lngMap": 0,
          "zoomMap": 0,
          "commentable": true,
          "costable": true,
          "categories": [
            {
              "id": "pCategory1",
              "name": "Aménagement"
            },
            {
              "id": @string@,
              "name": "New category"
            },
            {
              "id": "pCategory2",
              "name": "Politique"
            }
          ],
          "districts": @wildcard@,
          "questions": []
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to update custom fields of a proposal form
  Given I am logged in to graphql as admin
  And I send a GraphQL POST request:
  """
  {
    "query": "mutation ($input: UpdateProposalFormInput!) {
      updateProposalForm(input: $input) {
        proposalForm {
          id
          questions {
            id
            position
            helpText
            private
            required
            title
            type
          }
        }
      }
    }",
    "variables": {
      "input": {
        "proposalFormId": "proposalForm1",
        "questions": [
          {
            "position": 1,
            "question": {
              "title": "Etes-vous réél ?",
              "helpText": "Peut-être que non...",
              "private": false,
              "required": true,
              "type": "text"
            }
          },
          {
            "position": 2,
            "question": {
              "title": "Documents à remplir",
              "helpText": "5 fichiers max",
              "private": false,
              "required": true,
              "type": "medias"
            }
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
      "updateProposalForm": {
        "proposalForm": {
          "id": "proposalForm1",
          "questions": [
            {
              "id": @string@,
              "position": 1,
              "title": "Etes-vous réél ?",
              "helpText": "Peut-être que non...",
              "private": false,
              "required": true,
              "type": "text"
            },
            {
              "id": @string@,
              "position": 2,
              "title": "Documents à remplir",
              "helpText": "5 fichiers max",
              "private": false,
              "required": true,
              "type": "medias"
            }
          ]
        }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to retrieve his evaluations
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
      proposalForm(id: "proposalForm1") {
        step {
          title
          project {
            title
          }
        }
        proposals(affiliations: [EVALUER]) {
          totalCount
          edges {
            node {
              id
            }
          }
        }
      }
  }
  """
  Then the JSON response should match:
  """
  {
    "data": {
      "proposalForm": {
          "step": {
            "title": @string@,
            "project": {
              "title": @string@
            }
          },
          "proposals": {
            "totalCount": 2,
            "edges": [
              {
                "node": {
                  "id": "proposal1"
                }
              },
              {
                "node": {
                  "id": "proposal2"
                }
              }
            ]
          }
      }
    }
  }
  """

@database
Scenario: GraphQL client wants to retrieve his evaluations
  Given I am logged in to graphql as user
  When I send a GraphQL request:
  """
  {
      proposalForm(id: "proposalForm1") {
        evaluationForm {
          questions {
            id
            title
            position
            private
            required
            helpText
            type
            isOtherAllowed
            validationRule {
              type
              number
            }
            choices {
              id
              title
              description
              color
            }
          }
        }
      }
  }
  """
  Then the JSON response should match:
  """
  {"data":{"questionnaire":{"questions":[{"id":"2","title":"\u00cates-vous satisfait que la ville de Paris soit candidate \u00e0 l\u0027organisation des JO de 2024 ?","position":1,"private":false,"required":true,"helpText":null,"type":"text","isOtherAllowed":false,"validationRule":null,"choices":null},{"id":"13","title":"Pour quel type d\u0027\u00e9preuve \u00eates vous pr\u00eat \u00e0 acheter des places ?","position":2,"private":false,"required":true,"helpText":"Plusieurs choix sont possibles","type":"checkbox","isOtherAllowed":true,"validationRule":{"type":"equal","number":"3"},"choices":[{"id":"questionchoice1","title":"Athl\u00e9tisme","description":null,"color":null},{"id":"questionchoice2","title":"Natation","description":null,"color":null},{"id":"questionchoice3","title":"Sports collectifs","description":null,"color":null},{"id":"questionchoice4","title":"Sports individuels","description":null,"color":null}]},{"id":"14","title":"Quel est ton athl\u00e8te favori ?","position":3,"private":false,"required":false,"helpText":"Un seul choix possible","type":"radio","isOtherAllowed":true,"validationRule":null,"choices":[{"id":"questionchoice5","title":"Maxime Arrouard","description":null,"color":null},{"id":"questionchoice6","title":"Superman","description":null,"color":null},{"id":"questionchoice7","title":"Cyril Lage","description":null,"color":null},{"id":"questionchoice8","title":"Spylou Super Sayen","description":null,"color":null}]},{"id":"15","title":"Nelson Monfort parle-t-il:","position":4,"private":false,"required":false,"helpText":"Merci de r\u00e9pondre sinc\u00e8rement","type":"select","isOtherAllowed":false,"validationRule":null,"choices":[{"id":"questionchoice9","title":"Trop fort (Mon sonotone est tout neuf)","description":null,"color":null},{"id":"questionchoice10","title":"Assez fort (Mon sonotone est mal r\u00e9gl\u00e9)","description":null,"color":null},{"id":"questionchoice11","title":"Pas assez fort (Mon sonotone est en panne)","description":null,"color":null}]},{"id":"16","title":"Classez vos choix","position":5,"private":false,"required":false,"helpText":"Pour chaque valeur, vous pouvez assigner un classement ou glisser-d\u00e9poser au bon endroit dans la colonne de droite.","type":"ranking","isOtherAllowed":false,"validationRule":{"type":"min","number":"2"},"choices":[{"id":"questionchoice12","title":"Choix 1","description":"Description","color":null},{"id":"questionchoice13","title":"Choix 2","description":"Description","color":null},{"id":"questionchoice14","title":"Choix 3 avec un titre tr\u00e8s long pour le test du rendu","description":null,"color":null}]},{"id":"18","title":"Choissez le meilleur logo","position":5,"private":false,"required":false,"helpText":null,"type":"radio","isOtherAllowed":false,"validationRule":null,"choices":[{"id":"questionchoice17","title":"Logo 1","description":null,"color":null},{"id":"questionchoice18","title":"Logo 2","description":null,"color":null}]},{"id":"19","title":"Est-ce que Martoni a encore une balle dans son chargeur ?","position":6,"private":false,"required":false,"helpText":null,"type":"button","isOtherAllowed":false,"validationRule":null,"choices":[{"id":"questionchoice19","title":"Oui","description":null,"color":"#5cb85c"},{"id":"questionchoice20","title":"Il bluffe","description":null,"color":"#d9534f"}]}]}}}
  """
