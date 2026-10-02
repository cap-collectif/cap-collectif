import '../../../_setupDB'

const AddEventsMutation = /* GraphQL */ `
  mutation AddEvents($input: AddEventsInput!) {
    addEvents(input: $input) {
      importedEvents {
        timeRange {
          startAt
          endAt
        }
        author {
          id
        }
        themes {
          id
        }
        projects {
          id
        }
        address
        commentable
        address
        zipCode
        city
        country
        translations {
          title
          body
          link
        }
        districts {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`

const input = {
  events: [
    {
      startAt: '2018-03-07 00:00:00',
      endAt: '2018-03-16 00:00:00',
      authorEmail: 'aurelien@cap-collectif.com',
      themes: ['Immobilier'],
      projects: ['Projet externe', 'Croissance, innovation, disruption'],
      address: '25 rue Claude Tillier',
      zipCode: '75012',
      commentable: false,
      enabled: true,
      guestListEnabled: true,
      customCode: 'customCode',
      city: 'Paris',
      country: 'France',
      translations: [
        {
          locale: 'FR_FR',
          title: 'Rencontre avec les habitants',
          body: '<h1>Mon super event</h1><p>Rassurez vous, tout le monde est invité</p>',
          metaDescription: 'metaDescription',
          link: 'https://facebook.com/inscrivez-vous-ici',
        },
      ],
      districts: ['Premier Quartier'],
    },
  ],
  dryRun: false,
}

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a GraphQL response snapshot; add explicit assertions for the API contract.
 */
describe('mutations.addEventsInput', () => {
  it('wants to add a list of events with dry run as admin', async () => {
    await expect(graphql(AddEventsMutation, { input: input }, 'internal_admin')).resolves.toMatchSnapshot()
  })
})
