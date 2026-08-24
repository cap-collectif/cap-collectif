/* eslint-env jest */
import '../../_setupES'

const ProjectCommentsQuery = /* GraphQL */ `
  query ProjectCommentsQuery($projectId: ID!, $first: Int, $onlyTrashed: Boolean, $orderBy: CommentOrder!) {
    node(id: $projectId) {
      id
      ... on Project {
        comments(first: $first, onlyTrashed: $onlyTrashed, orderBy: $orderBy) {
          totalCount
          edges {
            node {
              _id
            }
          }
        }
      }
    }
  }
`

const ProjectConsultationStepOpenQuery = /* GraphQL */ `
  query ProjectConsultationStepOpenQuery($projectId: ID!) {
    node(id: $projectId) {
      ... on Project {
        consultationStepOpen {
          title
        }
      }
    }
  }
`

const ProjectPostsQuery = /* GraphQL */ `
  query ProjectPostsQuery($projectId: ID!) {
    node(id: $projectId) {
      ... on Project {
        posts {
          totalCount
          edges {
            node {
              title
              isPublished
              publishedAt
            }
          }
        }
      }
    }
  }
`

const ProjectRestrictedViewersQuery = /* GraphQL */ `
  query ProjectRestrictedViewersQuery($projectId: ID!, $count: Int, $cursor: String) {
    project: node(id: $projectId) {
      ... on Project {
        restrictedViewers(first: $count, after: $cursor) {
          edges {
            cursor
            node {
              id
              title
            }
          }
          totalCount
          totalUserCount
        }
      }
    }
  }
`

const ProjectAuthorsQuery = /* GraphQL */ `
  query ProjectAuthorsQuery {
    projectAuthors {
      username
    }
  }
`

const ProjectTypesQuery = /* GraphQL */ `
  query ProjectTypesQuery {
    projectTypes {
      id
      title
    }
  }
`

const UsedProjectTypesQuery = /* GraphQL */ `
  query UsedProjectTypesQuery($onlyUsedByProjects: Boolean) {
    projectTypes(onlyUsedByProjects: $onlyUsedByProjects) {
      id
      title
      slug
    }
  }
`

const ProposalRandomOrderQuery = /* GraphQL */ `
  query ProposalRandomOrderQuery($proposalForm: ID!) {
    proposalForm: node(id: $proposalForm) {
      ... on ProposalForm {
        proposals(first: 10, orderBy: { field: RANDOM, direction: DESC }) {
          edges {
            node {
              id
              createdAt
            }
          }
        }
      }
    }
  }
`

const ProposalVotesQuery = /* GraphQL */ `
  query ProposalVotesQuery($proposalId: ID!, $first: Int, $stepId: ID!, $includeUnpublished: Boolean) {
    proposal: node(id: $proposalId) {
      ... on Proposal {
        votes(first: $first, stepId: $stepId, includeUnpublished: $includeUnpublished) {
          edges {
            node {
              id
              ... on ProposalVote {
                published
              }
            }
          }
        }
      }
    }
  }
`

const ProposalStepVotesQuery = /* GraphQL */ `
  query ProposalStepVotesQuery($id: ID!, $count: Int!, $after: String) {
    node(id: $id) {
      ... on ProposalStep {
        id
        proposals {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              votes(first: $count, after: $after) {
                pageInfo {
                  startCursor
                  hasNextPage
                  endCursor
                }
                totalCount
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const ProposalVotesAfterQuery = /* GraphQL */ `
  query ProposalVotesAfterQuery($id: ID!, $count: Int!, $after: String) {
    node(id: $id) {
      ... on Proposal {
        id
        votes(first: $count, orderBy: { field: PUBLISHED_AT, direction: DESC }, after: $after) {
          pageInfo {
            startCursor
            hasNextPage
            endCursor
          }
          totalCount
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

const ProposalVotesByStepQuery = /* GraphQL */ `
  query ProposalVotesByStepQuery($collectId: ID!, $selectionId: ID!, $count: Int!) {
    node(id: $collectId) {
      ... on ProposalStep {
        id
        proposals {
          edges {
            cursor
            node {
              id
              allVotes: votes(first: $count) {
                totalCount
                edges {
                  node {
                    id
                    ... on ProposalVote {
                      published
                    }
                    step {
                      title
                      __typename
                    }
                  }
                }
              }
              votesOnCollect: votes(first: $count, stepId: $collectId) {
                totalCount
                edges {
                  node {
                    id
                    ... on ProposalVote {
                      published
                    }
                    step {
                      title
                      __typename
                    }
                  }
                }
              }
              votesOnSelection: votes(first: $count, stepId: $selectionId) {
                totalCount
                edges {
                  node {
                    id
                    ... on ProposalVote {
                      published
                    }
                    step {
                      title
                      __typename
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const ProposalFollowersQuery = /* GraphQL */ `
  query ProposalFollowersQuery($proposalId: ID!, $count: Int, $cursor: String) {
    proposal: node(id: $proposalId) {
      ... on Proposal {
        followers(first: $count, after: $cursor) {
          edges {
            cursor
            node {
              _id
            }
          }
        }
      }
    }
  }
`

const ProposalFollowersPaginationQuery = /* GraphQL */ `
  query ProposalFollowersPaginationQuery($proposalId: ID!, $count: Int, $cursor: String) {
    proposal: node(id: $proposalId) {
      id
      ... on Proposal {
        followers(first: $count, after: $cursor) {
          edges {
            cursor
            node {
              id
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    }
  }
`

const FollowingProposalsQuery = /* GraphQL */ `
  query FollowingProposalsQuery($count: Int, $cursor: String) {
    viewer {
      followingProposals(first: $count, after: $cursor) {
        edges {
          cursor
          node {
            id
          }
        }
      }
    }
  }
`

describe('Internal|Query projects and proposals', () => {
  it('lists trashed project comments in reverse publication order', async () => {
    await expect(
      graphql(
        ProjectCommentsQuery,
        {
          projectId: toGlobalId('Project', 'project6'),
          first: 10,
          onlyTrashed: true,
          orderBy: { field: 'PUBLISHED_AT', direction: 'DESC' },
        },
        'internal_kiroule',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('gets the open consultation step of a project', async () => {
    await expect(
      graphql(
        ProjectConsultationStepOpenQuery,
        {
          projectId: toGlobalId('Project', 'project2'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('gets the published posts linked to a project', async () => {
    await expect(
      graphql(
        ProjectPostsQuery,
        {
          projectId: toGlobalId('Project', 'project2'),
        },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('gets the groups allowed to view a restricted project', async () => {
    await expect(
      graphql(
        ProjectRestrictedViewersQuery,
        {
          projectId: toGlobalId('Project', 'ProjectWithCustomAccess'),
          count: 32,
          cursor: null,
        },
        'internal_kiroule',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('lists project authors', async () => {
    await expect(graphql(ProjectAuthorsQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })

  it('lists all project types', async () => {
    await expect(graphql(ProjectTypesQuery, {}, 'internal')).resolves.toMatchSnapshot()
  })

  it.each(['internal', 'internal_user', 'internal_admin'])(
    'lists project types used by projects for %s',
    async client => {
      await expect(graphql(UsedProjectTypesQuery, { onlyUsedByProjects: true }, client)).resolves.toMatchSnapshot()
    },
  )

  it('returns a different random proposal ordering for two users', async () => {
    const variables = { proposalForm: 'proposalform1' }
    const userResult = await graphql(ProposalRandomOrderQuery, variables, 'internal_user')
    const adminResult = await graphql(ProposalRandomOrderQuery, variables, 'internal_admin')
    expect(adminResult).not.toEqual(userResult)
  })

  it('includes unpublished votes when requested', async () => {
    await expect(
      graphql(
        ProposalVotesQuery,
        {
          proposalId: toGlobalId('Proposal', 'proposal17'),
          stepId: toGlobalId('SelectionStep', 'selectionstep8'),
          first: 50,
          includeUnpublished: true,
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it.each([5, 15])('paginates proposal-step votes with a page size of %i', async count => {
    await expect(
      graphql(
        ProposalStepVotesQuery,
        {
          id: toGlobalId('SelectionStep', 'selectionstep1'),
          count,
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('paginates proposal votes after a cursor', async () => {
    await expect(
      graphql(
        ProposalVotesAfterQuery,
        {
          id: toGlobalId('Proposal', 'proposal3'),
          count: 5,
          after: 'YToyOntpOjA7aToxNDg1OTA2MzYwMDAwO2k6MTtzOjQ6IjEwNDMiO30=',
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('separates votes on collect and selection steps', async () => {
    await expect(
      graphql(
        ProposalVotesByStepQuery,
        {
          collectId: toGlobalId('CollectStep', 'collectstep1'),
          selectionId: toGlobalId('SelectionStep', 'selectionstep1'),
          count: 3,
        },
        'internal_user',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('lists a proposal followers', async () => {
    await expect(
      graphql(
        ProposalFollowersQuery,
        {
          proposalId: toGlobalId('Proposal', 'proposal10'),
          count: 32,
          cursor: null,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('lists proposals followed by the current user', async () => {
    await expect(
      graphql(FollowingProposalsQuery, { count: 32, cursor: null }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it.each([null, 'YXJyYXljb25uZWN0aW9uOjMx'])('paginates proposal followers after %s', async cursor => {
    await expect(
      graphql(
        ProposalFollowersPaginationQuery,
        {
          proposalId: toGlobalId('Proposal', 'proposal1'),
          count: 32,
          cursor,
        },
        'internal_admin',
      ),
    ).resolves.toMatchSnapshot()
  })
})
