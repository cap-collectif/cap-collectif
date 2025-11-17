/* eslint-env jest */
import '../../../_setup'

const UpdateProjectMutation = /* GraphQL*/ `
    mutation ($input: UpdateProjectInput!) {
      updateProject(input: $input) {
        project {
          title
          authors {
            id
            username
            email
            createdAt
          }
          address {
            formatted
          }
          type {
            title
          }
          locale {
            code
          }
        }
      }
    }
`

describe('mutations.updateProjectMutation', () => {
  it('GraphQL admin wants to update a project and add an author', async () => {
    await expect(
      graphql(
        UpdateProjectMutation,
        {
          input: {
            id: 'UHJvamVjdDpwcm9qZWN0MQ==',
            title: 'thisisnotatestupdated',
            authors: [
              'VXNlcjp1c2VyQWRtaW4=',
              'VXNlcjp1c2VyMQ==',
              'VXNlcjp1c2VyMg==',
              'T3JnYW5pemF0aW9uOm9yZ2FuaXphdGlvbjI=',
            ],
            projectType: '2',
            address:
              '[{"address_components" : [{"long_name" : "155","short_name" : "155","types" : [ "street_number" ]},{"long_name" : "Boulevard Saint-Germain","short_name" : "Boulevard Saint-Germain","types" : [ "route" ]},{"long_name" : "Paris","short_name" : "Paris","types" : [ "locality", "political" ]},{"long_name" : "Département de Paris","short_name" : "Département de Paris","types" : [ "administrative_area_level_2", "political" ]},{"long_name" : "Île-de-France","short_name" : "IDF","types" : [ "administrative_area_level_1", "political" ]},{"long_name" : "France","short_name" : "FR","types" : [ "country", "political" ]},{"long_name" : "75006","short_name" : "75006","types" : [ "postal_code" ]}],"formatted_address" : "155 Boulevard Saint-Germain, 75006 Paris, France","geometry" : {"location" : {"lat" : 48.8538407,"lng" : 2.3321014},"location_type" : "ROOFTOP","viewport" : {"northeast" : {"lat" : 48.8551896802915,"lng" : 2.333450380291502},"southwest" : {"lat" : 48.8524917197085,"lng" : 2.330752419708498}}},"place_id" : "ChIJq9_ddtdx5kcRRoIJStYdLlA","plus_code" : {"compound_code" : "V83J+GR Paris, France","global_code" : "8FW4V83J+GR"},"types" : [ "street_address" ]}]',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to update a project and delete an author', async () => {
    await expect(
      graphql(
        UpdateProjectMutation,
        {
          input: {
            id: 'UHJvamVjdDpwcm9qZWN0MQ==',
            title: 'thisisnotatestupdated',
            authors: ['VXNlcjp1c2VyMg=='],
            projectType: '2',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to update a project without type', async () => {
    await expect(
      graphql(
        UpdateProjectMutation,
        {
          input: {
            id: 'UHJvamVjdDpwcm9qZWN0MQ==',
            title: 'thisisnotatestupdated',
            authors: ['VXNlcjp1c2VyQWRtaW4=', 'VXNlcjp1c2VyMQ==', 'VXNlcjp1c2VyMg=='],
            projectType: null,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to update a project without authors', async () => {
    await expect(
      graphql(
        UpdateProjectMutation,
        {
          input: {
            id: 'UHJvamVjdDpwcm9qZWN0MQ==',
            title: 'thisisnotatestupdated',
            authors: [],
            projectType: null,
          },
        },
        'internal_admin',
      ),
    ).rejects.toThrowError('You must specify at least one author')
  })

  it('GraphQL admin wants to add a locale to a project', async () => {
    await expect(
      graphql(
        UpdateProjectMutation,
        {
          input: {
            id: 'UHJvamVjdDpwcm9qZWN0MQ==',
            locale: 'locale-en-GB',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to remove locale from a project', async () => {
    await graphql(
      UpdateProjectMutation,
      {
        input: {
          id: 'UHJvamVjdDpwcm9qZWN0MQ==',
          locale: 'locale-en-GB',
        },
      },
      'internal_admin',
    )

    await expect(
      graphql(
        UpdateProjectMutation,
        {
          input: {
            id: 'UHJvamVjdDpwcm9qZWN0MQ==',
            locale: null,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
