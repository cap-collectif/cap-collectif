import '../../_setup';

const CreateOrUpdateConsultationMutation = /* GraphQL */ `
    mutation CreateOrUpdateConsultationMutation(
      $input: CreateOrUpdateConsultationInput!
    ) {
      createOrUpdateConsultation(input: $input) {
        consultations {
          title
          description
          sections {
            title
            description
            subtitle
            position
            contribuable
            versionable
            sourceable
            votesHelpText
            sections {
              title
              description
              subtitle
              position
              contribuable
              versionable
              sourceable
              votesHelpText
              sections {
                title
                description
                subtitle
                position
                contribuable
                versionable
                sourceable
                votesHelpText
                sections {
                  title
                  description
                  subtitle
                  position
                  contribuable
                  versionable
                  sourceable
                  votesHelpText
                }
              }
            }
          }
        }
      }
    }
`;

const input = {
  "consultations": [
    {
      "id": "Q29uc3VsdGF0aW9uOmRlZmF1bHQ=",
      "title": "Défaut",
      "description": null,
      "illustration": null,
      "sections": [
        {
          "color": "white",
          "id": "opinionType8",
          "position": 0,
          "title": "Le problème constaté",
          "description": null,
          "contribuable": false,
          "versionable": false,
          "sourceable": true,
          "subtitle": null,
          "defaultOrderBy": "votes",
          "votesHelpText": "Bon courage pour le votes",
          "sections": []
        },
        {
          "color": "white",
          "id": "opinionType9",
          "position": 1,
          "title": "Les causes",
          "description": null,
          "contribuable": true,
          "versionable": false,
          "sourceable": false,
          "subtitle": null,
          "defaultOrderBy": "votes",
          "votesHelpText": null,
          "sections": []
        },
        {
          "color": "white",
          "id": "opinionType10",
          "position": 2,
          "title": "Les enjeux",
          "description": null,
          "contribuable": true,
          "versionable": false,
          "sourceable": false,
          "subtitle": null,
          "defaultOrderBy": "votes",
          "votesHelpText": null,
          "sections": []
        },
        {
          "position": 3,
          "title": "Nouvelle section",
          "description": "<p>description de la nouvelle section</p>",
          "contribuable": true,
          "versionable": true,
          "sourceable": true,
          "subtitle": "sous titre de la nouvelle section",
          "votesHelpText": "texte d'aide de la nouvelle section",
          "defaultOrderBy": "favorable",
          "color": "white",
          "sections": []
        }
      ],
      "position": 0
    }
  ],
  "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE="
}

const inputWithSubSections = {
  "consultations": [
    {
      "id": "Q29uc3VsdGF0aW9uOmRlZmF1bHQ=",
      "sections": [
        {
          "color": "white",
          "id": "opinionType5bis",
          "position": 0,
          "title": "Titre Ier",
          "description": null,
          "contribuable": false,
          "versionable": false,
          "sourceable": false,
          "subtitle": "La circulation des données et du savoir",
          "defaultOrderBy": "positions",
          "votesHelpText": null,
          "sections": [
            {
              "color": "blue",
              "id": "opinionType5ter",
              "position": 1,
              "title": "Chapitre Ier",
              "description": null,
              "contribuable": false,
              "versionable": false,
              "sourceable": false,
              "subtitle": "Économie de la donnée",
              "defaultOrderBy": "positions",
              "votesHelpText": null,
              "sections": [
                {
                  "color": "blue",
                  "id": "opinionType5",
                  "position": 1,
                  "title": "Section 1",
                  "description": null,
                  "contribuable": true,
                  "versionable": true,
                  "sourceable": false,
                  "subtitle": "Ouverture des données publiques",
                  "defaultOrderBy": "positions",
                  "votesHelpText": "Bon votes à tous",
                  "sections": [
                    {
                      "color": "orange",
                      "id": "opinionType6",
                      "position": 1,
                      "title": "Sous-partie 1",
                      "description": null,
                      "contribuable": true,
                      "versionable": true,
                      "sourceable": true,
                      "subtitle": null,
                      "defaultOrderBy": "positions",
                      "votesHelpText": "Il faut voter en cliquant sur les boutons",
                      "sections": []
                    },
                    {
                      "color": "red",
                      "id": "opinionType7",
                      "position": 2,
                      "title": "Sous-partie 2",
                      "description": null,
                      "contribuable": true,
                      "versionable": true,
                      "sourceable": true,
                      "subtitle": null,
                      "defaultOrderBy": "positions",
                      "votesHelpText": "Bon courage pour le votes",
                      "sections": []
                    }
                  ]
                },
                {
                  "color": "orange",
                  "id": "opinionType17",
                  "position": 2,
                  "title": "Test17",
                  "description": null,
                  "contribuable": true,
                  "versionable": false,
                  "sourceable": false,
                  "subtitle": null,
                  "defaultOrderBy": "votes",
                  "votesHelpText": null,
                  "sections": []
                },
                {
                  "color": "orange",
                  "id": "opinionType18",
                  "position": 2,
                  "title": "Test18",
                  "description": null,
                  "contribuable": true,
                  "versionable": false,
                  "sourceable": false,
                  "subtitle": null,
                  "defaultOrderBy": "votes",
                  "votesHelpText": null,
                  "sections": []
                },
                {
                  "color": "orange",
                  "id": "opinionType19",
                  "position": 2,
                  "title": "Test19",
                  "description": null,
                  "contribuable": true,
                  "versionable": false,
                  "sourceable": false,
                  "subtitle": null,
                  "defaultOrderBy": "votes",
                  "votesHelpText": null,
                  "sections": []
                },
                {
                  "color": "orange",
                  "id": "opinionType20",
                  "position": 2,
                  "title": "Test20",
                  "description": null,
                  "contribuable": true,
                  "versionable": false,
                  "sourceable": false,
                  "subtitle": null,
                  "defaultOrderBy": "votes",
                  "votesHelpText": null,
                  "sections": []
                },
                {
                  "color": "orange",
                  "id": "opinionType21",
                  "position": 2,
                  "title": "Test21",
                  "description": null,
                  "contribuable": true,
                  "versionable": false,
                  "sourceable": false,
                  "subtitle": null,
                  "defaultOrderBy": "votes",
                  "votesHelpText": null,
                  "sections": []
                },
                {
                  "color": "orange",
                  "id": "opinionType22",
                  "position": 2,
                  "title": "Test22",
                  "description": null,
                  "contribuable": true,
                  "versionable": false,
                  "sourceable": false,
                  "subtitle": null,
                  "defaultOrderBy": "votes",
                  "votesHelpText": null,
                  "sections": []
                },
                {
                  "color": "orange",
                  "id": "opinionType23",
                  "position": 2,
                  "title": "Test23",
                  "description": null,
                  "contribuable": true,
                  "versionable": false,
                  "sourceable": false,
                  "subtitle": null,
                  "defaultOrderBy": "votes",
                  "votesHelpText": null,
                  "sections": []
                },
                {
                  "color": "orange",
                  "id": "opinionType24",
                  "position": 2,
                  "title": "Test24",
                  "description": null,
                  "contribuable": true,
                  "versionable": false,
                  "sourceable": false,
                  "subtitle": null,
                  "defaultOrderBy": "votes",
                  "votesHelpText": null,
                  "sections": []
                },
                {
                  "color": "orange",
                  "id": "opinionType25",
                  "position": 2,
                  "title": "Test25",
                  "description": null,
                  "contribuable": true,
                  "versionable": false,
                  "sourceable": false,
                  "subtitle": null,
                  "defaultOrderBy": "votes",
                  "votesHelpText": null,
                  "sections": []
                },
                {
                  "color": "orange",
                  "id": "opinionType26",
                  "position": 2,
                  "title": "Test26",
                  "description": null,
                  "contribuable": true,
                  "versionable": false,
                  "sourceable": false,
                  "subtitle": null,
                  "defaultOrderBy": "votes",
                  "votesHelpText": null,
                  "sections": []
                },
                {
                  "color": "orange",
                  "id": "opinionType27",
                  "position": 2,
                  "title": "Test27",
                  "description": null,
                  "contribuable": true,
                  "versionable": false,
                  "sourceable": false,
                  "subtitle": null,
                  "defaultOrderBy": "votes",
                  "votesHelpText": null,
                  "sections": []
                }
              ]
            }
          ]
        },
        {
          "color": "white",
          "id": "opinionType28",
          "position": 1,
          "title": "Titre II",
          "description": null,
          "contribuable": false,
          "versionable": false,
          "sourceable": false,
          "subtitle": "La protection dans la société numérique",
          "defaultOrderBy": "positions",
          "votesHelpText": null,
          "sections": [
            {
              "color": "red",
              "id": "opinionType28ter",
              "position": 1,
              "title": "Chapitre Ier",
              "description": null,
              "contribuable": false,
              "versionable": false,
              "sourceable": false,
              "subtitle": "Le numérique",
              "defaultOrderBy": "positions",
              "votesHelpText": null,
              "sections": []
            }
          ]
        },
        {
          "color": "white",
          "id": "opinionType29",
          "position": 2,
          "title": "Titre III",
          "description": null,
          "contribuable": false,
          "versionable": false,
          "sourceable": false,
          "subtitle": "L'accès au numérique",
          "defaultOrderBy": "positions",
          "votesHelpText": null,
          "sections": [
            {
              "color": "green",
              "id": "opinionType29ter",
              "position": 1,
              "title": "Chapitre Ier",
              "description": null,
              "contribuable": false,
              "versionable": false,
              "sourceable": false,
              "subtitle": "Encore le numérique",
              "defaultOrderBy": "positions",
              "votesHelpText": null,
              "sections": []
            }
          ]
        }
      ],
      "title": "Formulaire de consultation",
      "position": 0,
      "illustration": null
    }
  ],
  "stepId": "Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE="
}

describe('mutations.createOrUpdateConsultationMutation', () => {
  it('should update the existing sections and add a new one', async () => {
    await expect(
      graphql(
        CreateOrUpdateConsultationMutation,
        {input},
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });
  it('should update the existing sections containing subsections', async () => {
    await expect(
      graphql(
        CreateOrUpdateConsultationMutation,
        {
          input: inputWithSubSections
        },
        'internal_admin',
      )
    ).resolves.toMatchSnapshot();
  });
})
