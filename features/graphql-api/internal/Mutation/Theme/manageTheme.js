/* eslint-env jest */
import '../../../_setupDB'

const ThemeFields = /* GraphQL */ `
  fragment ThemeFields on Theme {
    id
    isEnabled
    position
    status
    customCode
    author {
      username
    }
    translations {
      locale
      title
      slug
      teaser
      body
      metaDescription
    }
  }
`

const ThemeQuery = /* GraphQL */ `
  query ($id: ID!) {
    theme(id: $id) {
      ...ThemeFields
    }
  }
  ${ThemeFields}
`

const AdminThemesQuery = /* GraphQL */ `
  query ($search: String) {
    adminThemes(search: $search, first: 50) {
      totalCount
      edges {
        node {
          id
          isEnabled
          title
        }
      }
    }
  }
`

const CreateThemeMutation = /* GraphQL */ `
  mutation ($input: CreateThemeInput!) {
    createTheme(input: $input) {
      errorCode
      theme {
        ...ThemeFields
      }
    }
  }
  ${ThemeFields}
`

const UpdateThemeMutation = /* GraphQL */ `
  mutation ($input: UpdateThemeInput!) {
    updateTheme(input: $input) {
      errorCode
      theme {
        ...ThemeFields
      }
    }
  }
  ${ThemeFields}
`

const DeleteThemeMutation = /* GraphQL */ `
  mutation ($input: DeleteThemeInput!) {
    deleteTheme(input: $input) {
      errorCode
      deletedThemeId
    }
  }
`

const getTheme = id => graphql(ThemeQuery, { id }, 'internal_admin').then(data => data.theme)

const getTranslation = (theme, locale) => theme.translations.find(translation => translation.locale === locale)

/**
 * @jest-status compliant
 * @jest-reason Exercises the internal GraphQL API as a given viewer and re-reads persisted effects through the API.
 */
describe('Internal|manageTheme', () => {
  it('creates a theme and lists it in the back office, even unpublished', async () => {
    const { createTheme } = await graphql(
      CreateThemeMutation,
      {
        input: {
          translations: [
            {
              locale: 'FR_FR',
              title: ' Nouveau thème ',
              teaser: 'Un sous-titre',
              body: '<p>Une description</p>',
              metaDescription: '',
            },
          ],
          author: toGlobalId('User', 'user5'),
          isEnabled: false,
          position: 7,
          status: 'OPENED',
          customCode: '<script>console.log("theme")</script>',
        },
      },
      'internal_admin',
    )

    expect(createTheme.errorCode).toBeNull()
    const persisted = await getTheme(createTheme.theme.id)
    expect(persisted).toMatchObject({
      isEnabled: false,
      position: 7,
      status: 'OPENED',
      customCode: '<script>console.log("theme")</script>',
      author: { username: 'user' },
    })
    expect(getTranslation(persisted, 'FR_FR')).toEqual({
      locale: 'FR_FR',
      title: 'Nouveau thème',
      slug: 'nouveau-theme',
      teaser: 'Un sous-titre',
      body: '<p>Une description</p>',
      metaDescription: null,
    })

    const { adminThemes } = await graphql(AdminThemesQuery, { search: 'Nouveau thème' }, 'internal_admin')
    expect(adminThemes.edges.map(edge => edge.node)).toEqual([
      { id: createTheme.theme.id, isEnabled: false, title: 'Nouveau thème' },
    ])
  })

  it('requires a title in the platform default locale', async () => {
    const { createTheme } = await graphql(
      CreateThemeMutation,
      { input: { translations: [{ locale: 'EN_GB', title: 'English only' }], position: 1 } },
      'internal_admin',
    )

    expect(createTheme).toEqual({ errorCode: 'TITLE_REQUIRED', theme: null })
  })

  it('rejects a meta description longer than 160 characters', async () => {
    const { createTheme } = await graphql(
      CreateThemeMutation,
      {
        input: { translations: [{ locale: 'FR_FR', title: 'Titre', metaDescription: 'a'.repeat(161) }], position: 1 },
      },
      'internal_admin',
    )

    expect(createTheme).toEqual({ errorCode: 'VALUE_TOO_LONG', theme: null })
  })

  it('accepts a meta description whose length only exceeds the limit with surrounding spaces', async () => {
    const metaDescription = 'a'.repeat(158)
    const { createTheme } = await graphql(
      CreateThemeMutation,
      {
        input: {
          translations: [{ locale: 'FR_FR', title: 'Titre', metaDescription: `${metaDescription}     ` }],
          position: 1,
        },
      },
      'internal_admin',
    )

    expect(createTheme.errorCode).toBeNull()
    expect(getTranslation(createTheme.theme, 'FR_FR').metaDescription).toBe(metaDescription)
  })

  it('updates a theme, clears its status and author, and keeps the translations that were not sent', async () => {
    const { updateTheme } = await graphql(
      UpdateThemeMutation,
      {
        input: {
          id: 'theme1',
          translations: [{ locale: 'FR_FR', title: 'Immobilier modifié', teaser: '' }],
          author: null,
          isEnabled: false,
          position: 12,
          status: null,
        },
      },
      'internal_admin',
    )

    expect(updateTheme.errorCode).toBeNull()
    const persisted = await getTheme('theme1')
    expect(persisted).toMatchObject({ isEnabled: false, position: 12, status: null, author: null })
    // The slug is generated once, from the original title
    expect(getTranslation(persisted, 'FR_FR')).toMatchObject({
      title: 'Immobilier modifié',
      slug: 'immobilier',
      teaser: null,
    })
    expect(getTranslation(persisted, 'EN_GB')).toMatchObject({ title: 'Immobilier in english' })
  })

  it('removes the translation of a locale sent with blank fields', async () => {
    const { updateTheme } = await graphql(
      UpdateThemeMutation,
      {
        input: {
          id: 'theme1',
          translations: [
            { locale: 'FR_FR', title: 'Immobilier' },
            { locale: 'EN_GB', title: ' ', teaser: '', body: '', metaDescription: '' },
          ],
        },
      },
      'internal_admin',
    )

    expect(updateTheme.errorCode).toBeNull()
    const persisted = await getTheme('theme1')
    expect(getTranslation(persisted, 'FR_FR')).toMatchObject({ title: 'Immobilier' })
    expect(getTranslation(persisted, 'EN_GB')).toBeUndefined()
  })

  it('requires a title in a locale whose other fields are filled', async () => {
    const { updateTheme } = await graphql(
      UpdateThemeMutation,
      {
        input: {
          id: 'theme1',
          translations: [
            { locale: 'FR_FR', title: 'Immobilier' },
            { locale: 'EN_GB', title: '', teaser: 'An English teaser' },
          ],
        },
      },
      'internal_admin',
    )

    expect(updateTheme).toEqual({ errorCode: 'TITLE_REQUIRED', theme: null })
  })

  it('updates the modification date when only a translation changes', async () => {
    const { updatedAt: previousUpdatedAt } = await graphql(
      /* GraphQL */ `
        query ($id: ID!) {
          theme(id: $id) {
            updatedAt
          }
        }
      `,
      { id: 'theme2' },
      'internal_admin',
    ).then(data => data.theme)

    const { updateTheme } = await graphql(
      /* GraphQL */ `
        mutation ($input: UpdateThemeInput!) {
          updateTheme(input: $input) {
            errorCode
            theme {
              updatedAt
            }
          }
        }
      `,
      { input: { id: 'theme2', translations: [{ locale: 'FR_FR', title: 'Justice modifiée' }] } },
      'internal_admin',
    )

    expect(updateTheme.errorCode).toBeNull()
    expect(new Date(updateTheme.theme.updatedAt).getTime()).toBeGreaterThan(new Date(previousUpdatedAt).getTime())
  })

  it('returns NOT_FOUND when updating an unknown theme', async () => {
    const { updateTheme } = await graphql(
      UpdateThemeMutation,
      { input: { id: 'unknown-theme', translations: [{ locale: 'FR_FR', title: 'Titre' }] } },
      'internal_admin',
    )

    expect(updateTheme).toEqual({ errorCode: 'NOT_FOUND', theme: null })
  })

  it('deletes a theme', async () => {
    const { deleteTheme } = await graphql(DeleteThemeMutation, { input: { id: 'theme4' } }, 'internal_admin')

    expect(deleteTheme).toEqual({ errorCode: null, deletedThemeId: 'theme4' })
    await expect(getTheme('theme4')).resolves.toBeNull()
  })

  it('denies the theme mutations to a regular user', async () => {
    await expect(graphql(DeleteThemeMutation, { input: { id: 'theme4' } }, 'internal_user')).rejects.toThrowError(
      'Access denied to this field.',
    )
    await expect(getTheme('theme4')).resolves.not.toBeNull()
  })
})
