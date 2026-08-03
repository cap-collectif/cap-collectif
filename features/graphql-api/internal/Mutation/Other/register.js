/* eslint-env jest */
import '../../../_setupDB'

const registrationMutation = /* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        displayName
      }
      errorsCode
    }
  }
`

const registrationErrorsMutation = /* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      errorsCode
    }
  }
`

const invitationRegistrationMutation = /* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        displayName
        groups {
          edges {
            node {
              id
            }
          }
        }
      }
      errorsCode
    }
  }
`

const input = {
  username: 'user2',
  email: 'user2@gmail.com',
  plainPassword: 'supersecureuserpass',
  captcha: 'fakekey',
  responses: [
    { question: toGlobalId('Question', '6'), value: 'Réponse à la question obligatoire' },
    { question: toGlobalId('Question', '17'), value: 'Sangohan' },
  ],
}

describe('Internal|register mutation', () => {
  beforeEach(async () => {
    await global.resetFeatureFlags()
  })

  afterEach(async () => {
    await global.resetFeatureFlags()
  })

  it('registers a user when registration is enabled', async () => {
    await global.enableFeatureFlag('registration')

    await expect(graphql(registrationMutation, { input }, 'internal')).resolves.toEqual({
      register: { user: { displayName: 'user2' }, errorsCode: null },
    })
  })

  it('returns REGISTER_FEATURE_NOT_ENABLED when registration is disabled', async () => {
    await global.disableFeatureFlag('registration')

    await expect(graphql(registrationErrorsMutation, { input }, 'internal')).resolves.toEqual({
      register: { errorsCode: ['REGISTER_FEATURE_NOT_ENABLED'] },
    })
  })

  it.each([
    ['email', '', 'EMAIL_BLANK'],
    ['username', '', 'USERNAME_BLANK'],
    ['plainPassword', '', 'PASSWORD_BLANK'],
    ['email', 'user2@yopmail.com', 'EMAIL_THROWABLE'],
  ])('returns %s validation errors', async (field, value, errorCode) => {
    await global.enableFeatureFlag('registration')

    await expect(
      graphql(registrationErrorsMutation, { input: { ...input, [field]: value } }, 'internal'),
    ).resolves.toEqual({
      register: { errorsCode: [errorCode] },
    })
  })

  it('rejects extra registration fields when optional fields are disabled', async () => {
    await global.enableFeatureFlag('registration')

    await expect(
      graphql(
        registrationErrorsMutation,
        { input: { ...input, zipcode: '99999', userType: toGlobalId('UserType', '2') } },
        'internal',
      ),
    ).resolves.toEqual({ register: { errorsCode: ['NO_EXTRA_FIELDS'] } })
  })

  it('registers a user with zipcode and type when their features are enabled', async () => {
    await global.enableFeatureFlag('registration')
    await global.enableFeatureFlag('user_type')
    await global.enableFeatureFlag('zipcode_at_register')

    await expect(
      graphql(
        registrationMutation,
        { input: { ...input, zipcode: '99999', userType: toGlobalId('UserType', '1') } },
        'internal',
      ),
    ).resolves.toEqual({
      register: { user: { displayName: 'user2' }, errorsCode: null },
    })
  })

  it('sanitizes a malicious username before persisting it', async () => {
    await global.enableFeatureFlag('registration')
    const maliciousInput = {
      ...input,
      username: '<h1><a href=x></a>pwned</h1>',
      email: 'pwned@gmail.com',
    }

    await expect(graphql(registrationErrorsMutation, { input: maliciousInput }, 'internal')).resolves.toEqual({
      register: { errorsCode: null },
    })
    await expect(
      global.runSQL(`SELECT username FROM fos_user WHERE email = "${maliciousInput.email}"`),
    ).resolves.toContain('pwned')
  })

  it('adds a registered user to the invited group', async () => {
    await global.enableFeatureFlag('registration')

    await expect(
      graphql(
        invitationRegistrationMutation,
        {
          input: {
            ...input,
            username: 'user invited in group',
            email: 'user-invited-in-group@gmail.com',
            invitationToken: 'invitedgrouptoken',
          },
        },
        'internal',
      ),
    ).resolves.toEqual({
      register: {
        user: {
          displayName: 'user invited in group',
          groups: { edges: [{ node: { id: toGlobalId('Group', 'group1') } }] },
        },
        errorsCode: null,
      },
    })
  })
})
