/* eslint-env jest */
import '../../../../_setupDB'

const UpdateProfileAccountEmailMutation = /* GraphQL*/ `
  mutation UpdateProfileAccountEmailMutation($input: UpdateProfileAccountEmailInput!) {
    updateProfileAccountEmail(input: $input) {
      viewer {
        email
        newEmailToConfirm
      }
      error
    }
  }
`

const UpdateProfileAccountLocaleMutation = /* GraphQL */ `
  mutation UpdateProfileAccountLocaleMutation($input: UpdateProfileAccountLocaleInput!) {
    updateProfileAccountLocale(input: $input) {
      viewer {
        locale
      }
      error
    }
  }
`

/**
 * @jest-status non-compliant
 * @jest-reason Relies on response snapshots for part of the API contract; add explicit assertions for those scenarios.
 */
describe('mutations.updateProfileAccountEmail', () => {
  it('should  update user email', async () => {
    const updateEmail = await graphql(
      UpdateProfileAccountEmailMutation,
      {
        input: {
          passwordConfirm: 'user',
          email: 'nouvelleadresseemail@cap-collectif.com',
        },
      },
      'internal_user',
    )
    expect(updateEmail).toMatchSnapshot()
  })

  it('should not update user email, cause of bad password', async () => {
    const updateEmail = await graphql(
      UpdateProfileAccountEmailMutation,
      {
        input: {
          passwordConfirm: 'badPassword',
          email: 'user@test.com',
        },
      },
      'internal_user',
    )
    expect(updateEmail).toMatchSnapshot()
  })
  it('should not update user email, cause of email ever used', async () => {
    const updateEmail = await graphql(
      UpdateProfileAccountEmailMutation,
      {
        input: {
          passwordConfirm: 'user',
          email: 'admin@test.com',
        },
      },
      'internal_user',
    )
    expect(updateEmail).toMatchSnapshot()
  })

  it('should not update user email, cause bad email', async () => {
    await global.resetFeatureFlags({ restrict_registration_via_email_domain: true })
    const updateEmail = await graphql(
      UpdateProfileAccountEmailMutation,
      {
        input: {
          passwordConfirm: 'user',
          email: 'admin@yopmail.com',
        },
      },
      'internal_user',
    )
    expect(updateEmail).toMatchSnapshot()
  })

  it('should update user is locale', async () => {
    const updateLocale = await graphql(
      UpdateProfileAccountLocaleMutation,
      {
        input: {
          locale: 'EN_GB',
        },
      },
      'internal_user',
    )
    expect(updateLocale).toMatchSnapshot()
  })
})
