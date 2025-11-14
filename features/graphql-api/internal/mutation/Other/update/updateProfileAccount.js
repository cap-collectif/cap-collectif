/* eslint-env jest */
import '../../../../_setup'

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
    await enableFeatureFlag('restrict_registration_via_email_domain')
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
    await disableFeatureFlag('restrict_registration_via_email_domain')
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
