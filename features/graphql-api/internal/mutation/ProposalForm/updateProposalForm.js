/*eslint-env jest */
import '../../../_setup'

const mutation = /* GraphQL */ `
  mutation UpdateProposalForm($input: UpdateProposalFormInput!) {
    updateProposalForm(input: $input) {
      proposalForm {
        title
        owner {
          username
        }
        titleHelpText
        allowAknowledge
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
        usingDescription
        usingSummary
        usingIllustration
        descriptionMandatory
        objectType
        proposalInAZoneRequired
        mapCenter {
          lat
          lng
        }
        zoomMap
        commentable
        costable
        categories(order: ALPHABETICAL) {
          name
          color
          categoryImage {
            image {
              url
              name
            }
          }
        }
        districts {
          name(locale: FR_FR)
          geojson
          displayedOnMap
        }
        questions {
          helpText
          private
          required
          title
          type
        }
        usingWebPage
        usingFacebook
        usingTwitter
        usingInstagram
        usingLinkedIn
        usingYoutube
      }
    }
  }
`

const defaultInput = {
  proposalFormId: 'proposalForm1',
  title: '   New title   ',
  titleHelpText: 'Title help',
  description: 'New description',
  descriptionHelpText: 'Description help',
  summaryHelpText: 'Summary Help',
  illustrationHelpText: 'Illustration Help',
  usingThemes: true,
  themeMandatory: true,
  themeHelpText: 'Theme Help',
  usingDistrict: true,
  allowAknowledge: true,
  districtMandatory: true,
  districtHelpText: 'District Help',
  usingCategories: true,
  categoryMandatory: true,
  proposalInAZoneRequired: true,
  categoryHelpText: 'Category Help',
  usingAddress: true,
  addressHelpText: 'Address help',
  usingDescription: true,
  usingSummary: true,
  usingIllustration: true,
  descriptionMandatory: true,
  objectType: 'PROPOSAL',
  mapCenter: '[{"geometry":{"location_type":"GEOMETRIC_CENTER","location":{"lat":"42","lng":"0"}}}]',
  zoomMap: 0,
  commentable: true,
  costable: true,
  categories: [
    {
      id: 'pCategory1',
      name: 'Aménagement',
      color: 'COLOR_880E4F',
      categoryImage: 'categoryImage15',
    },
    {
      id: 'pCategory2',
      color: 'COLOR_B71C1C',
      name: 'Politique',
    },
    {
      name: 'New category',
      color: 'COLOR_1E88E5',
      newCategoryImage: 'media5',
    },
    {
      name: 'Vide',
      color: 'COLOR_1B5E20',
    },
    {
      name: 'Image perso',
      color: 'COLOR_43A047',
      newCategoryImage: 'media6',
    },
    {
      name: 'Ecole',
      color: 'COLOR_827717',
      categoryImage: 'school',
    },
  ],
  districts: [
    {
      displayedOnMap: false,
      geojson: '',
      translations: [{ locale: 'fr-FR', name: 'Beauregard' }],
    },
    {
      displayedOnMap: true,
      geojson: '',
      translations: [{ locale: 'fr-FR', name: 'autre district' }],
    },
  ],
  questions: [],
  usingWebPage: true,
  usingFacebook: true,
  usingTwitter: true,
  usingInstagram: true,
  usingLinkedIn: true,
  usingYoutube: true,
}

describe('Internal | updateProposalForm', () => {
  it('project admin cannot update someone else proposalForm', async () => {
    await expect(
      graphql(
        mutation,
        {
          input: defaultInput,
        },
        'internal_theo',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
  it('project admin update his proposalForm', async () => {
    let input = defaultInput
    input.proposalFormId = 'proposalFormWithOwner'
    const response = await graphql(
      mutation,
      {
        input: input,
      },
      'internal_theo',
    )
    expect(response).toMatchSnapshot()
  })
  it('admin update someone else proposalForm', async () => {
    const response = await graphql(
      mutation,
      {
        input: defaultInput,
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  it('admin update custom fields of a proposalForm', async () => {
    const response = await graphql(
      mutation,
      {
        input: {
          proposalFormId: 'proposalForm1',
          questions: [
            {
              question: {
                title: 'Etes-vous réél ?',
                helpText: 'Peut-être que non...',
                private: false,
                required: true,
                type: 'text',
              },
            },
            {
              question: {
                title: ' Documents à remplir     ',
                helpText: '5 fichiers max',
                private: false,
                required: true,
                type: 'medias',
              },
            },
          ],
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  it('admin delete first question choice of a proposalForm', async () => {
    const response = await graphql(
      mutation,
      {
        input: {
          proposalFormId: 'proposalForm13',
          questions: [
            {
              question: {
                id: 'UXVlc3Rpb246MTMxNA==',
                private: false,
                required: false,
                title: 'Question simple?',
                type: 'text',
              },
            },
            {
              question: {
                id: 'UXVlc3Rpb246NDg=',
                title: 'Question Multiple?',
                helpText: null,
                description: null,
                type: 'radio',
                private: false,
                required: false,
                validationRule: null,
                choices: [
                  {
                    id: 'UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzMw==',
                    title: '  Non   ',
                    description: null,
                    color: null,
                    image: null,
                  },
                  {
                    id: 'UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNA==',
                    title: '    Peut être    ',
                    description: null,
                    color: null,
                    image: null,
                  },
                ],
                otherAllowed: false,
                randomQuestionChoices: false,
                jumps: [],
              },
            },
          ],
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  it('admin delete first question of a proposalForm', async () => {
    const response = await graphql(
      mutation,
      {
        input: {
          proposalFormId: 'proposalForm13',
          questions: [
            {
              question: {
                id: 'UXVlc3Rpb246NDg=',
                title: 'Question Multiple?           ',
                helpText: null,
                description: null,
                type: 'radio',
                private: false,
                required: false,
                validationRule: null,
                choices: [
                  {
                    id: 'UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzMw==',
                    title: 'Non           ',
                    description: null,
                    color: null,
                    image: null,
                  },
                  {
                    id: 'UXVlc3Rpb25DaG9pY2U6cXVlc3Rpb25jaG9pY2UzNA==',
                    title: 'Peut être',
                    description: null,
                    color: null,
                    image: null,
                  },
                ],
                otherAllowed: false,
                randomQuestionChoices: false,
                jumps: [],
              },
            },
          ],
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  it('admin delete first district of a proposalForm', async () => {
    const response = await graphql(
      mutation,
      {
        input: {
          proposalFormId: 'proposalForm13',
          districts: [
            {
              id: 'RGlzdHJpY3Q6ZGlzdHJpY3QxNQ==',
              translations: [{ locale: 'fr-FR', name: 'Quartier 2' }],
              displayedOnMap: true,
              geojson: null,
            },
            {
              id: 'RGlzdHJpY3Q6ZGlzdHJpY3QxNg==',
              translations: [{ locale: 'fr-FR', name: 'Quartier 3' }],
              displayedOnMap: true,
              geojson: null,
            },
          ],
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  it('admin delete first category of a proposalForm', async () => {
    const response = await graphql(
      mutation,
      {
        input: {
          proposalFormId: 'proposalForm13',
          categories: [
            {
              id: 'pCategory8',
              name: 'Escrime',
              color: 'COLOR_EF5350',
            },
            {
              id: 'pCategory7',
              name: 'Water Polo',
              color: 'COLOR_9C27B0',
            },
          ],
        },
      },
      'internal_admin',
    )
  })
  it('admin update view configuration of a proposalForm', async () => {
    const response = await graphql(
      mutation,
      {
        input: {
          proposalFormId: 'proposalForm13',
          isGridViewEnabled: false,
          isListViewEnabled: true,
        },
      },
      'internal_admin',
    )
    expect(response).toMatchSnapshot()
  })
  it('admin cannot disable all views of a proposalForm', async () => {
    await expect(
      graphql(
        mutation,
        {
          input: {
            proposalFormId: 'proposalForm13',
            isGridViewEnabled: false,
            isListViewEnabled: false,
            isMapViewEnabled: false,
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('No view is active. At least one must be selected')
  })
})
