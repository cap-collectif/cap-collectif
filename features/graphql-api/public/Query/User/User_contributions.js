/* eslint-env jest */
import '../../../_setupES'

const UserContributionsQuery = /* GraphQL */ `
  query UserContributionsCountByAuthorAndTypeQuery(
    $id: ID!
    $contribuableId: ID
    $type: ContributionType
    $orderBy: ContributionOrder
    $first: Int!
  ) {
    node(id: $id) {
      ... on User {
        contributions(contribuableId: $contribuableId, type: $type, orderBy: $orderBy, first: $first) {
          totalCount
          edges {
            node {
              id
              __typename
            }
          }
        }
      }
    }
  }
`

describe('User.contributions connection', () => {
  it("fetches a user's published, non-draft, non-trashed contributions by project", async () => {
    await Promise.all(
      [
        {
          user: 'user1',
          project: 'project1',
          after: 'YToyOntpOjA7aToxNDU2Nzg2ODAwMDAwO2k6MTtzOjc6InNvdXJjZTMiO30=',
        },
        { user: 'user2', project: 'project4' },
        {
          user: 'user5',
          project: 'project6',
          after: 'YToyOntpOjA7aToxNDg1OTM4NDAwMDAwO2k6MTtzOjEwOiJwcm9wb3NhbDEyIjt9',
        },
      ].map(async item => {
        await expect(
          graphql(
            UserContributionsQuery,
            {
              id: toGlobalId('User', item.user),
              contribuableId: toGlobalId('Project', item.project),
              first: 5,
              after: item.after ? item.after : null,
              orderBy: { field: 'CREATED_AT', direction: 'DESC' },
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(item.user)
      }),
    )
  })

  it("fetches a user's published, non-draft, non-trashed contributions by step", async () => {
    await Promise.all(
      [
        { user: 'user1', step: toGlobalId('ConsultationStep', 'cstep1') },
        { user: 'user2', step: toGlobalId('CollectStep', 'collectStep5') },
        { user: 'user5', step: toGlobalId('ConsultationStep', 'cstep7') },
      ].map(async item => {
        await expect(
          graphql(
            UserContributionsQuery,
            {
              id: toGlobalId('User', item.user),
              contribuableId: item.step,
              first: 3,
              orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(item.user)
      }),
    )
  })

  it("fetches a user's published, non-draft, non-trashed contributions by consultation", async () => {
    await Promise.all(
      [
        { user: 'user1', consultation: 'PJL' },
        { user: 'user2', consultation: 'default' },
        { user: 'user5', consultation: 'all' },
      ].map(async item => {
        await expect(
          graphql(
            UserContributionsQuery,
            {
              id: toGlobalId('User', item.user),
              contribuableId: toGlobalId('Consultation', item.consultation),
              first: 3,
              orderBy: { field: 'POPULAR', direction: 'ASC' },
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(item.user)
      }),
    )
  })

  it("fetches a user's published, non-draft, non-trashed contributions of different types", async () => {
    await Promise.all(
      [
        { user: 'user1', type: 'OPINION' },
        { user: 'user2', type: 'ARGUMENT' },
        { user: 'user5', type: 'SOURCE' },
      ].map(async item => {
        await expect(
          graphql(
            UserContributionsQuery,
            {
              id: toGlobalId('User', item.user),
              type: item.type,
              first: 5,
              orderBy: { field: 'CREATED_AT', direction: 'DESC' },
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(item.user)
      }),
    )
  })

  it("fetches a user's published, non-draft, non-trashed contributions of different types on contribuable", async () => {
    await Promise.all(
      [
        { user: 'user1', type: 'OPINION', contribuable: toGlobalId('Consultation', 'default') },
        { user: 'user2', type: 'ARGUMENT', contribuable: toGlobalId('ConsultationStep', 'cstep1') },
        { user: 'user5', type: 'SOURCE', contribuable: toGlobalId('Project', 'project1') },
      ].map(async item => {
        await expect(
          graphql(
            UserContributionsQuery,
            {
              id: toGlobalId('User', item.user),
              contribuableId: item.contribuable,
              type: item.type,
              first: 5,
              orderBy: { field: 'VOTE_COUNT', direction: 'DESC' },
            },
            'internal',
          ),
        ).resolves.toMatchSnapshot(item.user)
      }),
    )
  })
})
