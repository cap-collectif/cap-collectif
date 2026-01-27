/* eslint-env jest */
import '../../../_setupDB'

const CreateMailingListMutation = /* GraphQL*/ `
    mutation ($input: CreateMailingListInput!) {
      createMailingList(input: $input) {
        error
        mailingList {
          name
          project {
            title
          }
          users {
            totalCount
          }
          isDeletable
        }
      }
    }
`

describe('mutations.createMailingListMutation', () => {
  it('GraphQL project owner wants to create a mailing list without project', async () => {
    await expect(
      graphql(
        CreateMailingListMutation,
        {
          input: {
            name: 'equipe tech',
            userIds: [
              'VXNlcjp1c2VyTWlja2FlbA==',
              'VXNlcjp1c2VyU3B5bA==',
              'VXNlcjp1c2VyQWd1aQ==',
              'VXNlcjp1c2VyVGhlbw==',
              'VXNlcjp1c2VyT21hcg==',
              'VXNlcjp1c2VySmVhbg==',
              'VXNlcjp1c2VyTWF4aW1l',
              'VXNlcjp1c2VyVmluY2VudA==',
            ],
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL admin wants to create a mailing list from project', async () => {
    await expect(
      graphql(
        CreateMailingListMutation,
        {
          input: {
            name: 'equipe tech',
            userIds: [
              'VXNlcjp1c2VyTWlja2FlbA==',
              'VXNlcjp1c2VyU3B5bA==',
              'VXNlcjp1c2VyQWd1aQ==',
              'VXNlcjp1c2VyVGhlbw==',
              'VXNlcjp1c2VyT21hcg==',
              'VXNlcjp1c2VySmVhbg==',
              'VXNlcjp1c2VyTWF4aW1l',
              'VXNlcjp1c2VyVmluY2VudA==',
            ],
            project: 'UHJvamVjdDpwcm9qZWN0Q29yb25h',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner wants to create a mailing list from its project', async () => {
    await expect(
      graphql(
        CreateMailingListMutation,
        {
          input: {
            name: 'equipe tech',
            userIds: [
              'VXNlcjp1c2VyTWlja2FlbA==',
              'VXNlcjp1c2VyU3B5bA==',
              'VXNlcjp1c2VyQWd1aQ==',
              'VXNlcjp1c2VyVGhlbw==',
              'VXNlcjp1c2VyT21hcg==',
              'VXNlcjp1c2VySmVhbg==',
              'VXNlcjp1c2VyTWF4aW1l',
              'VXNlcjp1c2VyVmluY2VudA==',
            ],
            project: 'UHJvamVjdDpwcm9qZWN0V2l0aE93bmVy',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL client wants to create a mailing but send no user ids', async () => {
    await expect(
      graphql(
        CreateMailingListMutation,
        {
          input: {
            name: 'empty list',
            userIds: [],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL client wants to create a mailing but send wrong user id', async () => {
    await expect(
      graphql(
        CreateMailingListMutation,
        {
          input: {
            name: 'error list',
            userIds: ['wrongId'],
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL client wants to create a mailing but send wrong project id', async () => {
    await expect(
      graphql(
        CreateMailingListMutation,
        {
          input: {
            name: 'error list',
            userIds: ['VXNlcjp1c2VyTWlja2FlbA=='],
            project: 'wrongId',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL project owner wants to create a mailing list from other one project', async () => {
    await expect(
      graphql(
        CreateMailingListMutation,
        {
          input: {
            name: 'equipe tech',
            userIds: [
              'VXNlcjp1c2VyTWlja2FlbA==',
              'VXNlcjp1c2VyU3B5bA==',
              'VXNlcjp1c2VyQWd1aQ==',
              'VXNlcjp1c2VyVGhlbw==',
              'VXNlcjp1c2VyT21hcg==',
              'VXNlcjp1c2VySmVhbg==',
              'VXNlcjp1c2VyTWF4aW1l',
              'VXNlcjp1c2VyVmluY2VudA==',
            ],
            project: 'UHJvamVjdDpwcm9qZWN0Q29yb25h',
          },
        },
        'internal_theo',
      ),
    ).resolves.toMatchSnapshot()
  })
})
