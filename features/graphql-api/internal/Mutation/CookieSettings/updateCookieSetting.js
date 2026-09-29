/* eslint-env jest */
import '../../../_setupDB'

const CookieSettingsQuery = /* GraphQL */ `
  query {
    cookieSettings {
      id
      keyname
    }
  }
`

const UpdateCookieSettingMutation = /* GraphQL */ `
  mutation ($input: UpdateCookieSettingInput!) {
    updateCookieSetting(input: $input) {
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

const getCookieSettingId = async () => {
  const data = await graphql(CookieSettingsQuery, {}, 'internal_super_admin')
  return data.cookieSettings.find(param => 'cookies-list' === param.keyname).id
}

const updateCookieSetting = (input, user = 'internal_super_admin') =>
  graphql(UpdateCookieSettingMutation, { input }, user)

// Translations are returned in database order, which is not stable for freshly inserted rows.
const sortTranslations = response => {
  response.updateCookieSetting.siteParameter?.translations.sort((a, b) => a.locale.localeCompare(b.locale))
  return response
}

describe('Internal|updateCookieSetting', () => {
  it('updates the value and isEnabled as super-admin', async () => {
    const id = await getCookieSettingId()

    await expect(
      updateCookieSetting({ id, isEnabled: false, translations: [{ locale: 'FR_FR', value: 'New cookie list' }] }),
    ).resolves.toMatchSnapshot()
  })

  it('stores the value under the platform default locale when multilangue is disabled', async () => {
    await global.disableFeatureFlag('multilangue')
    const id = await getCookieSettingId()

    await expect(
      updateCookieSetting({
        id,
        isEnabled: true,
        translations: [{ locale: 'EN_GB', value: 'Stored under the default locale' }],
      }),
    ).resolves.toMatchSnapshot()
  })

  it('creates, updates and removes the translation of another locale when multilangue is enabled', async () => {
    await global.enableFeatureFlag('multilangue')
    const id = await getCookieSettingId()

    try {
      const created = await updateCookieSetting({
        id,
        isEnabled: true,
        translations: [
          { locale: 'FR_FR', value: '<p>Liste des cookies</p>' },
          { locale: 'EN_GB', value: '<p>Cookie list</p>' },
        ],
      })
      expect(sortTranslations(created)).toMatchSnapshot('create')

      const updated = await updateCookieSetting({
        id,
        isEnabled: true,
        translations: [{ locale: 'EN_GB', value: '<p>Cookie list, edited</p>' }],
      })
      expect(sortTranslations(updated)).toMatchSnapshot('update')

      const removed = await updateCookieSetting({
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
    const id = await getCookieSettingId()

    await expect(
      updateCookieSetting(
        { id, isEnabled: false, translations: [{ locale: 'FR_FR', value: 'New cookie list' }] },
        'internal_user',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })
})
