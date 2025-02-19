/* eslint-env jest */
import '../../../../_setup';

const AddEventMutation = /* GraphQL*/ `
    mutation ($input: AddEventInput!) {
        addEvent(input: $input) {
            eventEdge {
                node {
                    title
                    body
                    author {
                        username
                    }
                    owner {
                        username
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
                    link
                    review {
                        reviewer {
                            id
                            username
                        }
                    }
                    commentable
                    googleMapsAddress {
                        json
                        formatted
                    }
                    isMeasurable,
                    maxRegistrations
                    
                }
            }
        }
    }
`;

const input = {
  startAt: '2018-03-07 00:00:00',
  endAt: '2018-03-16 00:00:00',
  themes: ['theme1'],
  projects: ['UHJvamVjdDpwcm9qZWN0MQ==', 'UHJvamVjdDpwcm9qZWN0Mg=='],
  commentable: false,
  enabled: true,
  guestListEnabled: true,
  customCode: 'customCode',
  addressJson:
    '[{"address_components":[{"long_name":"25","short_name":"25","types":["street_number"]},{"long_name":"Rue Claude Tillier","short_name":"Rue Claude Tillier","types":["route"]},{"long_name":"Paris","short_name":"Paris","types":["locality","political"]},{"long_name":"Arrondissement de Paris","short_name":"Arrondissement de Paris","types":["administrative_area_level_2","political"]},{"long_name":"Île-de-France","short_name":"Île-de-France","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"75012","short_name":"75012","types":["postal_code"]}],"formatted_address":"25 Rue Claude Tillier, 75012 Paris, France","geometry":{"bounds":{"south":48.8484736,"west":2.3882939999999735,"north":48.8485762,"east":2.388451199999963},"location":{"lat":48.8485327,"lng":2.3883663000000297},"location_type":"ROOFTOP","viewport":{"south":48.8471759197085,"west":2.3870236197085433,"north":48.8498738802915,"east":2.389721580291507}},"place_id":"ChIJGRpmzgxy5kcRPt50gCGa7kM","types":["premise"]}]',
  translations: [
    {
      locale: 'FR_FR',
      title: 'Rencontre avec les habitants',
      body: 'Tout le monde est invité',
      metaDescription: 'metaDescription',
    },
  ],
};

describe('mutations.createEvent', () => {
  it('should create an event as project admin', async () => {
    const response = await graphql(
      AddEventMutation,
      {
        input,
      },
      'internal_theo',
    );

    expect(response.addEvent.eventEdge.node.owner.username).toBe('Théo QP');
    expect(response.addEvent.eventEdge.node.author.username).toBe('Théo QP');
  });

  it('should create an event', async () => {
    await expect(
      graphql(
        AddEventMutation,
        {
          input,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('should create an event with measurable registration', async () => {
    await expect(
      graphql(
        AddEventMutation,
        {
          input: {
            ...input,
            measurable: true,
            maxRegistrations: 10,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot();
  });

  it('should not create an event with measurable registration', async () => {
    await expect(
      graphql(
        AddEventMutation,
        {
          input: {
            ...input,
            measurable: true,
            maxRegistrations: -1,
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError();
  });

  it('should create an event as organization', async () => {
    const organizationId = toGlobalId('Organization', 'organization2');
    await expect(
      graphql(
        AddEventMutation,
        {
          input: {
            ...input,
            projects: [],
            customCode: undefined,
            author: organizationId,
            owner: organizationId,
          },
        },
        'internal_christophe',
      ),
    ).resolves.toMatchSnapshot();
  });
});
