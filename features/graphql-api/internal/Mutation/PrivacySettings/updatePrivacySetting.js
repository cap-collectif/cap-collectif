/* eslint-env jest */
import '../../../_setupDB'

const PrivacySettingsQuery = /* GraphQL */ `
  query {
    privacySettings {
      id
      keyname
    }
  }
`

const UpdatePrivacySettingMutation = /* GraphQL */ `
  mutation ($input: UpdatePrivacySettingInput!) {
    updatePrivacySetting(input: $input) {
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

const getPrivacySettingId = async () => {
  const data = await graphql(PrivacySettingsQuery, {}, 'internal_super_admin')
  return data.privacySettings.find(param => 'privacy-policy' === param.keyname).id
}

const updatePrivacySetting = (input, user = 'internal_super_admin') =>
  graphql(UpdatePrivacySettingMutation, { input }, user)

// Translations are returned in database order, which is not stable for freshly inserted rows.
const sortTranslations = response => {
  response.updatePrivacySetting.siteParameter?.translations.sort((a, b) => a.locale.localeCompare(b.locale))
  return response
}

describe('Internal|updatePrivacySetting', () => {
  it('updates the value and isEnabled as super-admin', async () => {
    const id = await getPrivacySettingId()

    await expect(
      updatePrivacySetting({ id, isEnabled: false, translations: [{ locale: 'FR_FR', value: 'New privacy policy' }] }),
    ).resolves.toMatchSnapshot()
  })

  it('stores the value under the platform default locale when multilangue is disabled', async () => {
    await global.disableFeatureFlag('multilangue')
    const id = await getPrivacySettingId()

    await expect(
      updatePrivacySetting({
        id,
        isEnabled: true,
        translations: [{ locale: 'EN_GB', value: 'Stored under the default locale' }],
      }),
    ).resolves.toMatchSnapshot()
  })

  it('creates, updates and removes the translation of another locale when multilangue is enabled', async () => {
    await global.enableFeatureFlag('multilangue')
    const id = await getPrivacySettingId()

    try {
      const created = await updatePrivacySetting({
        id,
        isEnabled: true,
        translations: [
          { locale: 'FR_FR', value: '<p>Politique de confidentialité</p>' },
          { locale: 'EN_GB', value: '<p>Privacy policy</p>' },
        ],
      })
      expect(sortTranslations(created)).toMatchSnapshot('create')

      const updated = await updatePrivacySetting({
        id,
        isEnabled: true,
        translations: [{ locale: 'EN_GB', value: '<p>Privacy policy, edited</p>' }],
      })
      expect(sortTranslations(updated)).toMatchSnapshot('update')

      const removed = await updatePrivacySetting({
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
    const id = await getPrivacySettingId()

    await expect(
      updatePrivacySetting(
        { id, isEnabled: false, translations: [{ locale: 'FR_FR', value: 'New privacy policy' }] },
        'internal_user',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
