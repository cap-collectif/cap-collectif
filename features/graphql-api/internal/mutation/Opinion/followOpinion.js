/* eslint-env jest */
import '../../../_setup'

/* eslint-env jest */
const FollowOpinionMutation = /* GraphQL */ `
  mutation ($input: FollowOpinionInput!) {
    followOpinion(input: $input) {
      opinion {
        ... on Opinion {
          id
          viewerFollowingConfiguration
        }
        ... on Version {
          id
          viewerFollowingConfiguration
        }
      }
    }
  }
`

const UnfollowOpinionMutation = /* GraphQL */ `
  mutation ($input: UnfollowOpinionInput!) {
    unfollowOpinion(input: $input) {
      opinion {
        ... on Opinion {
          id
        }
        ... on Version {
          id
        }
      }
    }
  }
`

const GetFollowingOpinion = /* GraphQL */ `
  query getFollowingOpinion($count: Int, $cursor: String) {
    viewer {
      followingOpinions(first: $count, after: $cursor) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

describe('Internal followOpinionMutation', () => {
  it('GraphQL client wants to follow an opinion with current user and check if opinion if followed', async () => {
    await expect(
      graphql(
        FollowOpinionMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uNw==',
            notifiedOf: 'MINIMAL',
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        GetFollowingOpinion,
        {
          input: {
            count: 32,
            cursor: null,
          },
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('GraphQL client wants to follow then unfollow an opinion with current user', async () => {
    await expect(
      graphql(
        FollowOpinionMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uMTA=',
            notifiedOf: 'MINIMAL',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        GetFollowingOpinion,
        {
          input: {
            count: 32,
            cursor: null,
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        UnfollowOpinionMutation,
        {
          input: {
            opinionId: 'T3BpbmlvbjpvcGluaW9uMTA=',
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()

    await expect(
      graphql(
        GetFollowingOpinion,
        {
          input: {
            count: 32,
            cursor: null,
          },
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })
})
