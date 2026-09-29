/* eslint-env jest */
import '../../../_setupDB'

const CustomCodeConfigurationQuery = /* GraphQL */ `
  query CustomCodeConfigurationQuery($versionsLimit: Int) {
    customCodeConfiguration(versionsLimit: $versionsLimit) {
      keyname
      label
      description
      activeContentHash
      versionsCount
      versions {
        id
        keyname
        title
        authorName
        description
        referenceUrl
        content
        contentHash
        previousContentHash
        type
      }
    }
  }
`

const CustomCodeVersionsQuery = /* GraphQL */ `
  query CustomCodeVersionsQuery($keyname: String!, $limit: Int, $offset: Int) {
    customCodeVersions(keyname: $keyname, limit: $limit, offset: $offset) {
      id
      keyname
      title
      authorName
      description
      referenceUrl
      content
      contentHash
      previousContentHash
      type
    }
  }
`

const CustomCodeVersionQuery = /* GraphQL */ `
  query CustomCodeVersionQuery($id: ID!) {
    customCodeVersion(id: $id) {
      id
      keyname
      title
      authorName
      description
      referenceUrl
      content
      contentHash
      previousContentHash
      type
      restoredFromVersion {
        id
      }
    }
  }
`

describe('Internal|CustomCode versioning queries', () => {
  it('returns custom code configuration with descriptions and version metadata', async () => {
    const response = await graphql(CustomCodeConfigurationQuery, { versionsLimit: 2 }, 'internal_super_admin')

    const membersCustomCode = response.customCodeConfiguration.find(({ keyname }) => keyname === 'members.customcode')

    expect(membersCustomCode).toEqual({
      keyname: 'members.customcode',
      label: 'Membres',
      description: 'Code injecté sur les pages des membres.',
      activeContentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      versionsCount: 2,
      versions: [
        {
          id: global.toGlobalId('CustomCodeVersion', 'customCodeVersionMembersCurrent'),
          keyname: 'members.customcode',
          title: 'Version courante membres',
          authorName: 'Cap Collectif',
          description: 'Fixture version courante membres',
          referenceUrl: 'https://example.com/custom-code/members-current',
          content: null,
          contentHash: '80baa053af7bd02fd0c0cf23b548f1f00a2fa5ec4beae1dbec53a1f05c48b04b',
          previousContentHash: 'a8fb43996797a549edf250a6c5da3f6a71a01b059b3294b0ffccda8260cf2f5e',
          type: 'COMMIT',
        },
        {
          id: global.toGlobalId('CustomCodeVersion', 'customCodeVersionMembersInitial'),
          keyname: 'members.customcode',
          title: 'Version initiale membres',
          authorName: 'System',
          description: 'Fixture initiale membres',
          referenceUrl: null,
          content: null,
          contentHash: 'a8fb43996797a549edf250a6c5da3f6a71a01b059b3294b0ffccda8260cf2f5e',
          previousContentHash: null,
          type: 'INITIAL',
        },
      ],
    })
  })

  it('returns custom code versions ordered from latest to oldest', async () => {
    const response = await graphql(
      CustomCodeVersionsQuery,
      { keyname: 'members.customcode', limit: 2, offset: 0 },
      'internal_super_admin',
    )

    expect(response.customCodeVersions).toEqual([
      expect.objectContaining({
        id: global.toGlobalId('CustomCodeVersion', 'customCodeVersionMembersCurrent'),
        content: null,
        type: 'COMMIT',
      }),
      expect.objectContaining({
        id: global.toGlobalId('CustomCodeVersion', 'customCodeVersionMembersInitial'),
        content: null,
        type: 'INITIAL',
      }),
    ])
  })

  it('returns a custom code version with its content', async () => {
    const response = await graphql(
      CustomCodeVersionQuery,
      { id: global.toGlobalId('CustomCodeVersion', 'customCodeVersionMembersInitial') },
      'internal_super_admin',
    )

    expect(response.customCodeVersion).toEqual({
      id: global.toGlobalId('CustomCodeVersion', 'customCodeVersionMembersInitial'),
      keyname: 'members.customcode',
      title: 'Version initiale membres',
      authorName: 'System',
      description: 'Fixture initiale membres',
      referenceUrl: null,
      content: '<style>.api-members-v1{color:#123456}</style>',
      contentHash: 'a8fb43996797a549edf250a6c5da3f6a71a01b059b3294b0ffccda8260cf2f5e',
      previousContentHash: null,
      type: 'INITIAL',
      restoredFromVersion: null,
    })
  })

  test.each(['internal_user', 'internal'])('denies custom code queries to %s', async user => {
    await expect(graphql(CustomCodeConfigurationQuery, { versionsLimit: 1 }, user)).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
