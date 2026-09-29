/* eslint-env jest */
import '../../../_setupDB'

const EMPTY_CONTENT_HASH = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
const CONTACT_V2_CONTENT_HASH = '96f208da52b9771930f7897b06b4c28f57bd5b9789e6c4c22f41a42448e3880a'

const CommitCustomCodeVersionMutation = /* GraphQL */ `
  mutation CommitCustomCodeVersionMutation($input: CommitCustomCodeVersionInput!) {
    commitCustomCodeVersion(input: $input) {
      errorCode
      customCode {
        keyname
        activeContent
        activeContentHash
      }
      version {
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
        createdByUserId
      }
    }
  }
`

const RestoreCustomCodeVersionMutation = /* GraphQL */ `
  mutation RestoreCustomCodeVersionMutation($input: RestoreCustomCodeVersionInput!) {
    restoreCustomCodeVersion(input: $input) {
      errorCode
      customCode {
        keyname
        activeContent
        activeContentHash
      }
      version {
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
          title
          content
        }
        createdByUserId
      }
    }
  }
`

const validCommitInput = {
  keyname: 'contact.customcode',
  title: 'Version test API contact',
  authorName: 'marie dupont',
  referenceUrl: 'https://example.com/custom-code/contact',
  content: '<script>window.__api_contact_v2 = true;</script>',
  baseContentHash: EMPTY_CONTENT_HASH,
}

const validRestoreInput = {
  versionId: global.toGlobalId('CustomCodeVersion', 'customCodeVersionContactInitial'),
  title: 'Restauration test API contact',
  authorName: 'jean martin',
  referenceUrl: 'https://example.com/custom-code/contact-restore',
  baseContentHash: EMPTY_CONTENT_HASH,
}

describe('Internal|CustomCode versioning mutations', () => {
  it('commits a custom code version as an authorized admin user', async () => {
    const response = await graphql(CommitCustomCodeVersionMutation, { input: validCommitInput }, 'internal_super_admin')

    expect(response.commitCustomCodeVersion.errorCode).toBeNull()
    expect(response.commitCustomCodeVersion.customCode).toEqual({
      keyname: 'contact.customcode',
      activeContent: '<script>window.__api_contact_v2 = true;</script>',
      activeContentHash: CONTACT_V2_CONTENT_HASH,
    })
    expect(response.commitCustomCodeVersion.version).toEqual(
      expect.objectContaining({
        keyname: 'contact.customcode',
        title: 'Version test API contact',
        authorName: 'Marie Dupont',
        description: null,
        referenceUrl: 'https://example.com/custom-code/contact',
        content: '<script>window.__api_contact_v2 = true;</script>',
        contentHash: CONTACT_V2_CONTENT_HASH,
        previousContentHash: EMPTY_CONTENT_HASH,
        type: 'COMMIT',
      }),
    )
  })

  it('restores a custom code version as an authorized admin user', async () => {
    const response = await graphql(
      RestoreCustomCodeVersionMutation,
      { input: validRestoreInput },
      'internal_super_admin',
    )

    expect(response.restoreCustomCodeVersion.errorCode).toBeNull()
    expect(response.restoreCustomCodeVersion.customCode).toEqual({
      keyname: 'contact.customcode',
      activeContent: '<script>window.__api_contact_v1 = true;</script>',
      activeContentHash: '9a8c2014c4b9cacce26cdca40e8fd04aa3b6395f2c6a44b64e30fb8ffc6c11f0',
    })
    expect(response.restoreCustomCodeVersion.version).toEqual(
      expect.objectContaining({
        keyname: 'contact.customcode',
        title: 'Restauration test API contact',
        authorName: 'Jean Martin',
        description: null,
        referenceUrl: 'https://example.com/custom-code/contact-restore',
        content: '<script>window.__api_contact_v1 = true;</script>',
        contentHash: '9a8c2014c4b9cacce26cdca40e8fd04aa3b6395f2c6a44b64e30fb8ffc6c11f0',
        previousContentHash: EMPTY_CONTENT_HASH,
        type: 'RESTORE',
      }),
    )
    expect(response.restoreCustomCodeVersion.version.restoredFromVersion).toEqual(
      expect.objectContaining({
        id: global.toGlobalId('CustomCodeVersion', 'customCodeVersionContactInitial'),
        title: 'Version initiale contact',
        content: null,
      }),
    )
  })

  test.each([
    ['commitCustomCodeVersion', CommitCustomCodeVersionMutation, validCommitInput],
    ['restoreCustomCodeVersion', RestoreCustomCodeVersionMutation, validRestoreInput],
  ])('%s validates the reference URL length after trimming', async (field, mutation, input) => {
    const referenceUrl = 'https://example.com/'.padEnd(2048, 'a')
    const rejected = await graphql(
      mutation,
      { input: { ...input, referenceUrl: referenceUrl + 'a' } },
      'internal_super_admin',
    )

    expect(rejected[field]).toEqual({ errorCode: 'INVALID_REFERENCE_URL', customCode: null, version: null })

    const accepted = await graphql(
      mutation,
      { input: { ...input, referenceUrl: `  ${referenceUrl}  ` } },
      'internal_super_admin',
    )

    expect(accepted[field].errorCode).toBeNull()
    expect(accepted[field].version.referenceUrl).toBe(referenceUrl)
  })

  test.each([
    {
      scenario: 'saving custom code for an unsupported area',
      errorCode: 'INVALID_KEYNAME',
      input: { ...validCommitInput, keyname: 'invalid.customcode' },
    },
    {
      scenario: 'saving content with an unsupported root HTML tag',
      errorCode: 'INVALID_CONTENT',
      input: { ...validCommitInput, content: '<div>Invalid root tag</div>' },
    },
    {
      scenario: 'saving HTML that escapes the body wrapper',
      errorCode: 'INVALID_CONTENT',
      input: { ...validCommitInput, content: '</body><img src=x onerror=alert(1)><body><script>x</script>' },
    },
    {
      scenario: 'saving a version without a title',
      errorCode: 'INVALID_METADATA',
      input: { ...validCommitInput, title: '' },
    },
    {
      scenario: 'saving a version with a whitespace-only title',
      errorCode: 'INVALID_METADATA',
      input: { ...validCommitInput, title: '   ' },
    },
    {
      scenario: 'saving a version with a whitespace-only author',
      errorCode: 'INVALID_METADATA',
      input: { ...validCommitInput, authorName: '   ' },
    },
    {
      scenario: 'saving a version with a non-HTTPS reference URL',
      errorCode: 'INVALID_REFERENCE_URL',
      input: { ...validCommitInput, referenceUrl: 'http://example.com/custom-code/contact' },
    },
    {
      scenario: 'saving a version whose content matches the active content',
      errorCode: 'NO_CHANGES',
      input: { ...validCommitInput, content: null },
    },
    {
      scenario: 'saving after the active content changed in another session',
      errorCode: 'CONFLICT',
      input: { ...validCommitInput, baseContentHash: 'invalid-base-content-hash' },
    },
  ])('returns $errorCode when $scenario', async ({ errorCode, input }) => {
    const response = await graphql(CommitCustomCodeVersionMutation, { input }, 'internal_super_admin')

    expect(response.commitCustomCodeVersion).toEqual({
      errorCode,
      customCode: null,
      version: null,
    })
  })

  test.each([
    {
      scenario: 'restoring a version with a whitespace-only title',
      input: { ...validRestoreInput, title: '   ' },
    },
    {
      scenario: 'restoring a version with a whitespace-only author',
      input: { ...validRestoreInput, authorName: '   ' },
    },
  ])('returns INVALID_METADATA when $scenario', async ({ input }) => {
    const response = await graphql(RestoreCustomCodeVersionMutation, { input }, 'internal_super_admin')

    expect(response.restoreCustomCodeVersion).toEqual({
      errorCode: 'INVALID_METADATA',
      customCode: null,
      version: null,
    })
  })

  it('returns VERSION_NOT_FOUND when restoring a version that no longer exists', async () => {
    const response = await graphql(
      RestoreCustomCodeVersionMutation,
      {
        input: {
          ...validRestoreInput,
          versionId: global.toGlobalId('CustomCodeVersion', 'customCodeVersionDoesNotExist'),
        },
      },
      'internal_super_admin',
    )

    expect(response.restoreCustomCodeVersion).toEqual({
      errorCode: 'VERSION_NOT_FOUND',
      customCode: null,
      version: null,
    })
  })

  test.each([
    ['commitCustomCodeVersion', CommitCustomCodeVersionMutation, { input: validCommitInput }],
    ['restoreCustomCodeVersion', RestoreCustomCodeVersionMutation, { input: validRestoreInput }],
  ])('denies %s to a regular user', async (_mutationName, mutation, variables) => {
    await expect(graphql(mutation, variables, 'internal_user')).rejects.toThrowError('Access denied to this field.')
  })
})
