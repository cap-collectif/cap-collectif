import '../../../_setup'

const AddEventsMutation = /* GraphQL */ `
  mutation ($input: AddEventInput!) {
    addEvent(input: $input) {
      eventEdge {
        node {
          id
          title
          body
          customCode
          author {
            ... on User {
              _id
            }
          }
          timeRange {
            startAt
            endAt
          }
          themes {
            id
          }
          projects {
            id
          }
          guestListEnabled
          link
          commentable
          review {
            createdAt
            status
            reviewer {
              id
              username
            }
          }
          googleMapsAddress {
            json
            formatted
          }
        }
      }
      userErrors {
        message
      }
    }
  }
`

describe('mutations.addEventMutation', () => {
  it('Admin wants to add an event with registration by external link', async () => {
    await expect(
      graphql(
        AddEventsMutation,
        {
          input: {
            startAt: '2018-03-07 00:00:00',
            endAt: '2018-03-16 00:00:00',
            themes: ['theme1'],
            projects: ['UHJvamVjdDpwcm9qZWN0MQ==', 'UHJvamVjdDpwcm9qZWN0Mg=='],
            commentable: false,
            enabled: true,
            guestListEnabled: false,
            customCode: 'customCode',
            addressJson:
              '[{"address_components":[{"long_name":"25","short_name":"25","types":["street_number"]},{"long_name":"Rue Claude Tillier","short_name":"Rue Claude Tillier","types":["route"]},{"long_name":"Paris","short_name":"Paris","types":["locality","political"]},{"long_name":"Arrondissement de Paris","short_name":"Arrondissement de Paris","types":["administrative_area_level_2","political"]},{"long_name":"Île-de-France","short_name":"Île-de-France","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"75012","short_name":"75012","types":["postal_code"]}],"formatted_address":"25 Rue Claude Tillier, 75012 Paris, France","geometry":{"bounds":{"south":48.8484736,"west":2.3882939999999735,"north":48.8485762,"east":2.388451199999963},"location":{"lat":48.8485327,"lng":2.3883663000000297},"location_type":"ROOFTOP","viewport":{"south":48.8471759197085,"west":2.3870236197085433,"north":48.8498738802915,"east":2.389721580291507}},"place_id":"ChIJGRpmzgxy5kcRPt50gCGa7kM","types":["premise"]}]',
            translations: [
              {
                locale: 'FR_FR',
                title: 'Rencontre avec les habitants',
                body: 'Tout le monde est invité',
                metaDescription: 'metaDescription',
                link: 'http://weezevent.com',
              },
            ],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot({
      addEvent: {
        eventEdge: {
          node: {
            id: expect.any(String),
          },
        },
      },
    })
  })

  it('User wants to add an event with custom code', async () => {
    await global.enableFeatureFlag('allow_users_to_propose_events')

    await expect(
      graphql(
        AddEventsMutation,
        {
          input: {
            startAt: '2018-03-07 00:00:00',
            customCode: 'customCode',
            guestListEnabled: true,
            translations: [
              {
                locale: 'FR_FR',
                title: 'Rencontre avec les habitants',
                body: 'Tout le monde est invité',
                metaDescription: 'metaDescription',
                link: 'http://weezevent.com',
              },
            ],
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User wants to add an event with bad date', async () => {
    await global.enableFeatureFlag('allow_users_to_propose_events')

    await expect(
      graphql(
        AddEventsMutation,
        {
          input: {
            startAt: '2018-04-07 00:00:00',
            endAt: '2018-03-07 00:00:00',
            guestListEnabled: true,
            translations: [
              {
                locale: 'FR_FR',
                title: 'Rencontre avec les habitants',
                body: 'Tout le monde est invité',
                metaDescription: 'metaDescription',
                link: 'http://weezevent.com',
              },
            ],
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User wants to add an event with 2 registration type', async () => {
    await global.enableFeatureFlag('allow_users_to_propose_events')

    await expect(
      graphql(
        AddEventsMutation,
        {
          input: {
            startAt: '2018-04-07 00:00:00',
            guestListEnabled: true,
            translations: [
              {
                locale: 'FR_FR',
                title: 'Rencontre avec les habitants',
                body: 'Tout le monde est invité',
                metaDescription: 'metaDescription',
                link: 'http://weezevent.com',
              },
            ],
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('User wants to add an event', async () => {
    await global.enableFeatureFlag('allow_users_to_propose_events')

    await expect(
      graphql(
        AddEventsMutation,
        {
          input: {
            startAt: '2018-03-07 00:00:00',
            endAt: '2018-03-16 00:00:00',
            themes: ['theme1'],
            projects: ['UHJvamVjdDpwcm9qZWN0MQ==', 'UHJvamVjdDpwcm9qZWN0Mg=='],
            commentable: false,
            guestListEnabled: true,
            addressJson:
              '[{"address_components":[{"long_name":"25","short_name":"25","types":["street_number"]},{"long_name":"Rue Claude Tillier","short_name":"Rue Claude Tillier","types":["route"]},{"long_name":"Paris","short_name":"Paris","types":["locality","political"]},{"long_name":"Arrondissement de Paris","short_name":"Arrondissement de Paris","types":["administrative_area_level_2","political"]},{"long_name":"Île-de-France","short_name":"Île-de-France","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"75012","short_name":"75012","types":["postal_code"]}],"formatted_address":"25 Rue Claude Tillier, 75012 Paris, France","geometry":{"bounds":{"south":48.8484736,"west":2.3882939999999735,"north":48.8485762,"east":2.388451199999963},"location":{"lat":48.8485327,"lng":2.3883663000000297},"location_type":"ROOFTOP","viewport":{"south":48.8471759197085,"west":2.3870236197085433,"north":48.8498738802915,"east":2.389721580291507}},"place_id":"ChIJGRpmzgxy5kcRPt50gCGa7kM","types":["premise"]}]',
            translations: [
              {
                locale: 'FR_FR',
                title: 'Rencontre avec les habitants',
                body: 'Tout le monde est invité',
              },
            ],
          },
        },
        'internal_agui',
      ),
    ).resolves.toMatchSnapshot({
      addEvent: {
        eventEdge: {
          node: {
            id: expect.any(String),
            review: {
              createdAt: expect.any(String),
            },
          },
        },
      },
    })
  })
})
