import '../../_setup'

const UpdateHomePageProjectsSectionConfigurationMutation = /* GraphQL */ `
  mutation UpdateHomePageProjectsSectionConfigurationMutation(
    $input: UpdateHomePageProjectsSectionConfigurationInput!
  ) {
    updateHomePageProjectsSectionConfiguration(input: $input) {
      errorCode
      homePageProjectsSectionConfiguration {
        title
        teaser
        position
        displayMode
        nbObjects
        enabled
        projects {
          edges {
            node {
              title
            }
          }
        }
      }
    }
  }
`

const inputMostRecentDisplayMode = {
  position: 3,
  displayMode: 'MOST_RECENT',
  nbObjects: 2,
  enabled: true,
  projects: [],
  translations: [
    {
      locale: 'fr-FR',
      title: 'titre',
      teaser: 'sous titre',
    },
  ],
}

const inputCustomDisplayMode = {
  position: 3,
  displayMode: 'CUSTOM',
  nbObjects: 2,
  enabled: true,
  projects: [
    'UHJvamVjdDpwcm9qZWN0Rm9vZA==',
    'UHJvamVjdDpwcm9qZWN0Q29uZmluZW1lbnQ=',
    'UHJvamVjdDpwcm9qZWN0V3lzaXd5Zw==',
  ],
  translations: [
    {
      locale: 'fr-FR',
      title: 'titre',
      teaser: 'sous titre',
    },
  ],
}

describe('mutations.updateHomePageProjectsSectionConfigurationMutation', () => {
  it('should update a HomePageProjectsSectionConfiguration with MOST_RECENT displayMode', async () => {
    await expect(
      graphql(
        UpdateHomePageProjectsSectionConfigurationMutation,
        { input: inputMostRecentDisplayMode },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
  it('should update a HomePageProjectsSectionConfiguration with CUSTOM displayMode', async () => {
    await expect(
      graphql(UpdateHomePageProjectsSectionConfigurationMutation, { input: inputCustomDisplayMode }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })
  it('should delete a project with CUSTOM displayMode', async () => {
    // add custom projects
    await graphql(
      UpdateHomePageProjectsSectionConfigurationMutation,
      { input: inputCustomDisplayMode },
      'internal_admin',
    )

    // delete last project
    await expect(
      graphql(
        UpdateHomePageProjectsSectionConfigurationMutation,
        {
          input: {
            ...inputCustomDisplayMode,
            projects: ['UHJvamVjdDpwcm9qZWN0Rm9vZA==', 'UHJvamVjdDpwcm9qZWN0Q29uZmluZW1lbnQ='],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
