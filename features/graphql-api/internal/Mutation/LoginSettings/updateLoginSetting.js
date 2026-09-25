/* eslint-env jest */
import '../../../_setupDB'

const LoginSettingsQuery = /* GraphQL */ `
  query {
    loginSettings {
      id
      keyname
    }
  }
`

const UpdateLoginSettingMutation = /* GraphQL */ `
  mutation ($input: UpdateLoginSettingInput!) {
    updateLoginSetting(input: $input) {
      errorCode
      siteParameter {
        keyname
        value
        isEnabled
        translations {
          locale
          value
        }
      }
    }
  }
`

const getLoginSettingId = async () => {
  const data = await graphql(LoginSettingsQuery, {}, 'internal_super_admin')
  return data.loginSettings.find(param => 'login.text.top' === param.keyname).id
}

const updateLoginSetting = (input, user = 'internal_super_admin') =>
  graphql(UpdateLoginSettingMutation, { input }, user)

// Translations are returned in database order, which is not stable for freshly inserted rows.
const sortTranslations = response => {
  response.updateLoginSetting.siteParameter?.translations.sort((a, b) => a.locale.localeCompare(b.locale))
  return response
}

describe('Internal|updateLoginSetting', () => {
  it('updates the value and isEnabled as super-admin', async () => {
    const id = await getLoginSettingId()

    await expect(
      updateLoginSetting({ id, isEnabled: false, translations: [{ locale: 'FR_FR', value: 'New warning message' }] }),
    ).resolves.toMatchSnapshot()
  })

  it('stores the value under the platform default locale when multilangue is disabled', async () => {
    await global.disableFeatureFlag('multilangue')
    const id = await getLoginSettingId()

    await expect(
      updateLoginSetting({
        id,
        isEnabled: true,
        translations: [{ locale: 'EN_GB', value: 'Stored under the default locale' }],
      }),
    ).resolves.toMatchSnapshot()
  })

  it('creates, updates and removes the translation of another locale when multilangue is enabled', async () => {
    await global.enableFeatureFlag('multilangue')
    const id = await getLoginSettingId()

    try {
      const created = await updateLoginSetting({
        id,
        isEnabled: true,
        translations: [
          { locale: 'FR_FR', value: '<p>Texte du haut</p>' },
          { locale: 'EN_GB', value: '<p>Top text</p>' },
        ],
      })
      expect(sortTranslations(created)).toMatchSnapshot('create')

      const updated = await updateLoginSetting({
        id,
        isEnabled: true,
        translations: [{ locale: 'EN_GB', value: '<p>Top text, edited</p>' }],
      })
      expect(sortTranslations(updated)).toMatchSnapshot('update')

      const removed = await updateLoginSetting({
        id,
        isEnabled: true,
        translations: [{ locale: 'EN_GB', value: '' }],
      })
      expect(sortTranslations(removed)).toMatchSnapshot('remove')
    } finally {
      await global.disableFeatureFlag('multilangue')
    }
  })

  it('denies the mutation as regular user', async () => {
    const id = await getLoginSettingId()

    await expect(
      updateLoginSetting(
        { id, isEnabled: false, translations: [{ locale: 'FR_FR', value: 'New warning message' }] },
        'internal_user',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
