/* eslint-env jest */

const GroupsQuery = /* GraphQL */ `
  query GroupsQuery {
    groups {
      edges {
        node {
          id
          title
          users {
            totalCount
            edges {
              node {
                username
                consentInternalCommunication
              }
            }
          }
          usersConsent: users(consentInternalCommunication: true) {
            totalCount
            edges {
              node {
                username
                consentInternalCommunication
              }
            }
          }
          notConsentingUsers: users(consentInternalCommunication: false) {
            totalCount
            edges {
              node {
                username
                consentInternalCommunication
              }
            }
          }
        }
      }
    }
  }
`

const GroupUsersQuery = /* GraphQL */ `
  query GroupUsersQuery($groupId: ID!, $count: Int, $cursor: String) {
    group: node(id: $groupId) {
      ... on Group {
        users(first: $count, after: $cursor) {
          edges {
            cursor
            node {
              id
              _id
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    }
  }
`

const IsEmailAlreadyTakenQuery = /* GraphQL */ `
  query IsEmailAlreadyTakenQuery($email: Email!) {
    isEmailAlreadyTaken(email: $email)
  }
`

const OrganizationsQuery = /* GraphQL */ `
  query OrganizationsQuery($search: String) {
    organizations(search: $search) {
      totalCount
      edges {
        node {
          title
        }
      }
    }
  }
`

const PersonalDataQuery = /* GraphQL */ `
  query PersonalDataQuery($userId: ID!) {
    user: node(id: $userId) {
      ... on User {
        firstname
        lastname
        dateOfBirth
        address
        address2
        zipCode
        city
        phone
      }
    }
  }
`

const ViewerPersonalDataQuery = /* GraphQL */ `
  query ViewerPersonalDataQuery {
    viewer {
      firstname
      lastname
      dateOfBirth
      address
      address2
      zipCode
      city
      phone
      gender
    }
  }
`

const RegistrationScriptQuery = /* GraphQL */ `
  query RegistrationScriptQuery {
    registrationScript
  }
`

const UserIdentificationCodeListsQuery = /* GraphQL */ `
  query UserIdentificationCodeListsQuery {
    viewer {
      userIdentificationCodeLists {
        totalCount
        edges {
          node {
            id
            name
            codesCount
            alreadyUsedCount
          }
        }
      }
    }
  }
`

const UsersQuery = /* GraphQL */ `
  query UsersQuery {
    users {
      totalCount
    }
    usersNotConfirmed: users(emailConfirmed: false) {
      totalCount
    }
    usersConfirmed: users(emailConfirmed: true) {
      totalCount
    }
    usersWithDisabled: users(withDisabled: true) {
      totalCount
    }
    usersWithSuperAdmin: users(superAdmin: true) {
      totalCount
    }
    usersOnlyProjectAdmin: users(onlyProjectAdmins: true) {
      totalCount
    }
    usersWithConsentInternalCommunication: users(consentInternalCommunication: true) {
      totalCount
    }
    usersWithoutConsentInternalCommunication: users(consentInternalCommunication: false) {
      totalCount
    }
  }
`

const PasswordComplexityScoreQuery = /* GraphQL */ `
  query PasswordComplexityScoreQuery($username: String, $password: String!, $email: String!) {
    passwordComplexityScore(username: $username, password: $password, email: $email)
  }
`

const ViewerQuery = /* GraphQL */ `
  query ViewerQuery($count: Int, $cursor: String) {
    viewer {
      notificationsConfiguration {
        onProposalCommentMail
      }
      followingOpinions(first: $count, after: $cursor) {
        edges {
          cursor
          node {
            id
          }
        }
      }
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

describe('Internal|Query identity and privacy', () => {
  it('lists groups and separates users by internal-communication consent', async () => {
    const response = await graphql(GroupsQuery, {}, 'internal_admin')
    expect(response.groups.edges[0].node).toEqual({
      id: toGlobalId('Group', 'group1'),
      title: 'Super-administrateur',
      users: {
        totalCount: 5,
        edges: [
          { node: { username: 'lbrunet', consentInternalCommunication: true } },
          { node: { username: 'sfavot', consentInternalCommunication: false } },
          { node: { username: 'user', consentInternalCommunication: true } },
          { node: { username: 'spyl', consentInternalCommunication: true } },
          { node: { username: 'welcomattic', consentInternalCommunication: false } },
        ],
      },
      usersConsent: {
        totalCount: 3,
        edges: [
          { node: { username: 'lbrunet', consentInternalCommunication: true } },
          { node: { username: 'user', consentInternalCommunication: true } },
          { node: { username: 'spyl', consentInternalCommunication: true } },
        ],
      },
      notConsentingUsers: {
        totalCount: 2,
        edges: [
          { node: { username: 'sfavot', consentInternalCommunication: false } },
          { node: { username: 'welcomattic', consentInternalCommunication: false } },
        ],
      },
    })
  })

  it('paginates the users of a group', async () => {
    const response = await graphql(
      GroupUsersQuery,
      { groupId: toGlobalId('Group', 'group3'), count: 32, cursor: null },
      'internal_admin',
    )
    expect(response.group.users.edges.slice(0, 2)).toEqual([
      { cursor: 'YXJyYXljb25uZWN0aW9uOjA=', node: { id: toGlobalId('User', 'user2'), _id: 'user2' } },
      { cursor: 'YXJyYXljb25uZWN0aW9uOjE=', node: { id: toGlobalId('User', 'user100'), _id: 'user100' } },
    ])
    expect(response.group.users.pageInfo).toEqual({
      hasPreviousPage: false,
      hasNextPage: true,
      startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
      endCursor: 'YXJyYXljb25uZWN0aW9uOjMx',
    })
  })

  it('reports an unused email address as available', async () => {
    await expect(
      graphql(IsEmailAlreadyTakenQuery, { email: 'notused@test.com' }, 'internal'),
    ).resolves.toMatchSnapshot()
  })

  it('reports an existing email address as taken', async () => {
    await expect(
      graphql(IsEmailAlreadyTakenQuery, { email: 'julien.aguilar@cap-collectif.com' }, 'internal'),
    ).resolves.toMatchSnapshot()
  })

  it('lists all organizations for an administrator', async () => {
    await expect(graphql(OrganizationsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('filters organizations by their title for an administrator', async () => {
    await expect(graphql(OrganizationsQuery, { search: 'parthenay' }, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('returns the authenticated user personal data', async () => {
    await expect(graphql(ViewerPersonalDataQuery, {}, 'internal_user')).resolves.toMatchSnapshot()
  })

  it('denies anonymous access to another user personal data', async () => {
    await expect(
      rawInternalGraphql(PersonalDataQuery, { userId: toGlobalId('User', 'user5') }),
    ).resolves.toEqual({
      data: {
        user: {
          firstname: null,
          lastname: null,
          dateOfBirth: null,
          address: null,
          address2: null,
          zipCode: null,
          city: null,
          phone: null,
        },
      },
      extensions: {
        warnings: expect.arrayContaining([expect.objectContaining({ message: 'Access denied to this field.' })]),
      },
    })
  })

  it('returns another user personal data to an administrator', async () => {
    await expect(
      graphql(PersonalDataQuery, { userId: toGlobalId('User', 'user5') }, 'internal_admin'),
    ).resolves.toMatchSnapshot()
  })

  it('denies a user access to another user personal data', async () => {
    await expect(
      rawInternalGraphql(PersonalDataQuery, { userId: toGlobalId('User', 'user5') }, {
        email: 'pierre@cap-collectif.com',
        password: 'toto',
      }),
    ).resolves.toEqual({
      data: {
        user: {
          firstname: null,
          lastname: null,
          dateOfBirth: null,
          address: null,
          address2: null,
          zipCode: null,
          city: null,
          phone: null,
        },
      },
      extensions: {
        warnings: expect.arrayContaining([expect.objectContaining({ message: 'Access denied to this field.' })]),
      },
    })
  })

  it('returns the registration tracking script', async () => {
    await expect(graphql(RegistrationScriptQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('denies a non-administrator access to user identification code lists', async () => {
    await expect(graphql(UserIdentificationCodeListsQuery, {}, 'internal_theo')).rejects.toThrow(
      'Access denied to this field.',
    )
  })

  it('returns user identification code lists to an administrator', async () => {
    await expect(graphql(UserIdentificationCodeListsQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('returns all user count filters to an administrator', async () => {
    await expect(graphql(UsersQuery, {}, 'internal_admin')).resolves.toMatchSnapshot()
  })

  it('scores a strong password', async () => {
    await expect(
      graphql(
        PasswordComplexityScoreQuery,
        { username: 'kjgkbng', password: 'Beiebiuhf67&!', email: 'jean.paul.bella@hotmail.fr' },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('scores a weak password', async () => {
    await expect(
      graphql(
        PasswordComplexityScoreQuery,
        { password: 'azertyuiop', email: 'jean.paul.bella@hotmail.fr' },
        'internal',
      ),
    ).resolves.toMatchSnapshot()
  })

  it('returns the current user notification configuration', async () => {
    const response = await graphql(ViewerQuery, { count: 5, cursor: null }, 'internal_user')
    expect(response.viewer.notificationsConfiguration.onProposalCommentMail).toEqual(expect.any(Boolean))
  })

  it('returns opinions followed by the current user', async () => {
    const response = await graphql(ViewerQuery, { count: 5, cursor: null }, 'internal_user')
    expect(response.viewer.followingOpinions).toMatchSnapshot()
  })

  it('returns proposals followed by the current user', async () => {
    const response = await graphql(ViewerQuery, { count: 32, cursor: null }, 'internal_admin')
    expect(response.viewer.followingProposals).toMatchSnapshot()
  })
})
