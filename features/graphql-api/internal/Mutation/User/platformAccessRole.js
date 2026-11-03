/* eslint-env jest */
import '../../../_setupDB'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
// user5 is the ordinary user fixture (user@test.com), with no administrative role.
const userId = toGlobalId('User', 'user5')
const mutation = /* GraphQL */ `
  mutation UpdatePlatformAccessRole($input: UpdateUserAccountInput!) {
    updateUserAccount(input: $input) {
      user {
        id
        roles
      }
    }
  }
`
const createUser = /* GraphQL */ `
  mutation CreateUserWithShieldRole($input: CreateUserInput!) {
    createUser(input: $input) {
      user {
        id
        roles
      }
    }
  }
`
const updateUser = /* GraphQL */ `
  mutation UpdateUserWithShieldRole($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        roles
      }
      validationErrors
    }
  }
`
const newUser = {
  username: 'shield-role-test',
  email: 'shield-role-test@example.org',
  plainPassword: 'Shield-Role-Test2026!',
}
const authorizedRoles = ['ROLE_USER', 'ROLE_SHIELD_AUTHORIZED_USER']
const query = /* GraphQL */ `
  query PlatformAccessRoles($id: ID!) {
    node(id: $id) {
      ... on User {
        id
        roles
      }
    }
  }
`

/**
 * @jest-status compliant
 * @jest-reason Exercises real GraphQL role assignment and revocation with named identities,
 * explicit authorization errors, independent persistence reads and failure-safe SQL cleanup.
 */
describe('Internal|platform access role', () => {
  afterAll(async () => {
    try {
      await graphql('{ __typename }', {}, 'internal')
    } finally {
      await execFileAsync('docker', [
        'exec',
        '-u',
        'capco',
        '-w',
        '/var/www',
        'capco_application_1',
        'bash',
        '-lc',
        process.env.CI_SHARED_TEST_DATA === '1'
          ? 'bash .circleci/profile-mysql-restore.sh'
          : 'mysql -h database -u root symfony < var/db.backup',
      ])
    }
  })

  test.each([
    ['admin', 'internal_admin'],
    ['super-admin', 'internal_super_admin'],
  ])('%s can grant and revoke platform access', async (_role, identity) => {
    await global.resetFeatureFlags({ shield_authorization_controls: true })
    const initial = await graphql(query, { id: userId }, identity)
    expect(initial.node).toEqual({ id: userId, roles: ['ROLE_USER'] })

    for (const roles of [['ROLE_USER', 'ROLE_SHIELD_AUTHORIZED_USER'], ['ROLE_USER']]) {
      const result = await graphql(mutation, { input: { userId, roles } }, identity)
      expect(result.updateUserAccount.user.id).toBe(userId)
      expect([...result.updateUserAccount.user.roles].sort()).toEqual([...roles].sort())

      const persisted = await graphql(query, { id: userId }, identity)
      expect(persisted.node.id).toBe(userId)
      expect([...persisted.node.roles].sort()).toEqual([...roles].sort())
    }
  })

  it('rejects granting the role when the feature is disabled', async () => {
    await global.resetFeatureFlags({ shield_authorization_controls: false })
    await expect(
      graphql(mutation, { input: { userId, roles: ['ROLE_USER', 'ROLE_SHIELD_AUTHORIZED_USER'] } }, 'internal_admin'),
    ).rejects.toThrow('The authorized-user shield role is disabled.')
    const persisted = await graphql(query, { id: userId }, 'internal_admin')
    expect(persisted.node.roles).toEqual(['ROLE_USER'])
  })

  it('allows creating an ordinary account but rejects creating an authorized account when controls are disabled', async () => {
    await global.resetFeatureFlags({ shield_authorization_controls: false })
    await expect(
      graphql(createUser, { input: { ...newUser, roles: authorizedRoles } }, 'internal_admin'),
    ).rejects.toThrow('The authorized-user shield role is disabled.')

    const result = await graphql(createUser, { input: newUser }, 'internal_admin')
    const persisted = await graphql(query, { id: result.createUser.user.id }, 'internal_admin')
    expect(persisted.node.roles).toEqual(['ROLE_USER'])
  })

  it('rejects granting shield authorization via updateUser when controls are disabled', async () => {
    await global.resetFeatureFlags({ shield_authorization_controls: false })
    await expect(
      graphql(updateUser, { input: { userId, username: 'user', roles: authorizedRoles } }, 'internal_admin'),
    ).rejects.toThrow('The authorized-user shield role is disabled.')
    const persisted = await graphql(query, { id: userId }, 'internal_admin')
    expect(persisted.node.roles).toEqual(['ROLE_USER'])
  })

  it('preserves a previously granted role during profile edits until controls are enabled again', async () => {
    await global.resetFeatureFlags({ shield_authorization_controls: true })
    const created = await graphql(createUser, { input: { ...newUser, roles: authorizedRoles } }, 'internal_admin')
    const id = created.createUser.user.id
    const updatedProfile = { userId: id, username: 'renamed-shield-user' }

    await global.resetFeatureFlags({ shield_authorization_controls: false })
    await expect(
      graphql(updateUser, { input: { ...updatedProfile, roles: ['ROLE_USER'] } }, 'internal_admin'),
    ).rejects.toThrow('The authorized-user shield role is disabled.')
    const updated = await graphql(
      updateUser,
      { input: { ...updatedProfile, roles: authorizedRoles } },
      'internal_admin',
    )
    expect(updated.updateUser.validationErrors).toBeNull()
    const persisted = await graphql(
      'query Profile($id: ID!) { node(id: $id) { ... on User { username roles } } }',
      { id },
      'internal_admin',
    )
    expect(persisted.node.username).toBe(updatedProfile.username)
    expect([...persisted.node.roles].sort()).toEqual([...authorizedRoles].sort())

    await global.resetFeatureFlags({ shield_authorization_controls: true })
    await graphql(updateUser, { input: { ...updatedProfile, roles: ['ROLE_USER'] } }, 'internal_admin')
    const revoked = await graphql(query, { id }, 'internal_admin')
    expect(revoked.node.roles).toEqual(['ROLE_USER'])
  })

  test.each([
    ['ordinary user granting themselves access', { email: 'user@test.com', password: 'user' }],
    ['anonymous visitor granting access', null],
  ])('rejects an %s', async (_scenario, credentials) => {
    const result = await rawInternalGraphql(
      mutation,
      { input: { userId, roles: ['ROLE_USER', 'ROLE_SHIELD_AUTHORIZED_USER'] } },
      credentials,
    )
    expect(result.errors).toEqual([
      expect.objectContaining({ message: 'Access denied to this field.', path: ['updateUserAccount'] }),
    ])
    expect(result.data.updateUserAccount).toBeNull()

    const persisted = await graphql(query, { id: userId }, 'internal_admin')
    expect(persisted.node).toEqual({ id: userId, roles: ['ROLE_USER'] })
  })
})
