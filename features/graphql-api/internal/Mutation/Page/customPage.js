/* eslint-env jest */
import '../../../_setupDB'

// Fixture "page1" (fixtures/Dev/Page.yaml): "FAQ FR" / "FAQ EN", linked to the "FAQ" menu item.
const FAQ_PAGE_ID = toGlobalId('Page', 'page1')

const CustomPageQuery = /* GraphQL */ `
  query CustomPageQuery($id: ID!) {
    customPage(id: $id) {
      id
      isEnabled
      customCode
      cover {
        id
      }
      translations {
        locale
        title
        body
        metaDescription
      }
    }
  }
`

const CustomPagesQuery = /* GraphQL */ `
  query CustomPagesQuery($search: String) {
    customPages(first: 10, search: $search) {
      totalCount
      edges {
        node {
          id
          title
          isEnabled
          menuItems {
            title
          }
        }
      }
    }
  }
`

const CreatePageMutation = /* GraphQL */ `
  mutation CreatePageMutation($input: CreatePageInput!) {
    createPage(input: $input) {
      page {
        id
      }
      errorCode
    }
  }
`

const UpdatePageMutation = /* GraphQL */ `
  mutation UpdatePageMutation($input: UpdatePageInput!) {
    updatePage(input: $input) {
      page {
        id
      }
      errorCode
    }
  }
`

const DeletePageMutation = /* GraphQL */ `
  mutation DeletePageMutation($input: DeletePageInput!) {
    deletePage(input: $input) {
      deletedPageId
      errorCode
    }
  }
`

const byLocale = translations => [...translations].sort((a, b) => a.locale.localeCompare(b.locale))

/**
 * @jest-status compliant
 * @jest-reason Exercises the internal GraphQL API and checks persisted effects with a new API read.
 */
describe('Internal|custom pages', () => {
  it('lists pages with their publication status and menu items, filtered by title', async () => {
    const response = await graphql(CustomPagesQuery, { search: 'FAQ' }, 'internal_admin')

    expect(response.customPages.totalCount).toBe(1)
    expect(response.customPages.edges[0].node).toEqual({
      id: FAQ_PAGE_ID,
      title: 'FAQ FR',
      isEnabled: true,
      menuItems: [{ title: 'FAQ' }],
    })
  })

  it('creates a page with its translations, cover and custom code', async () => {
    const { createPage } = await graphql(
      CreatePageMutation,
      {
        input: {
          isEnabled: false,
          cover: 'GiecLogo',
          customCode: '<script>console.log("page")</script>',
          translations: [
            { locale: 'FR_FR', title: 'Nouvelle page', body: '<p>Contenu</p>', metaDescription: '<b>Méta</b>' },
            { locale: 'EN_GB', title: 'New page', body: '<p>Content</p>' },
          ],
        },
      },
      'internal_admin',
    )

    expect(createPage.errorCode).toBeNull()

    const { customPage } = await graphql(CustomPageQuery, { id: createPage.page.id }, 'internal_admin')
    expect(customPage.isEnabled).toBe(false)
    expect(customPage.cover).toEqual({ id: 'GiecLogo' })
    expect(customPage.customCode).toBe('<script>console.log("page")</script>')
    expect(byLocale(customPage.translations)).toEqual([
      { locale: 'en-GB', title: 'New page', body: '<p>Content</p>', metaDescription: null },
      // The meta description is stored as plain text, like with Sonata.
      { locale: 'fr-FR', title: 'Nouvelle page', body: '<p>Contenu</p>', metaDescription: 'Méta' },
    ])
  })

  it.each([
    [
      'a title in the default locale',
      [{ locale: 'EN_GB', title: 'English only', body: '<p>Content</p>' }],
      'TITLE_REQUIRED',
    ],
    [
      'a content in the default locale',
      [{ locale: 'FR_FR', title: 'Sans contenu', body: '<p> </p>' }],
      'BODY_REQUIRED',
    ],
  ])('refuses to create a page without %s', async (_, translations, errorCode) => {
    const { createPage } = await graphql(CreatePageMutation, { input: { translations } }, 'internal_admin')

    expect(createPage).toEqual({ page: null, errorCode })
  })

  it('updates a page and removes its cover', async () => {
    const { updatePage } = await graphql(
      UpdatePageMutation,
      {
        input: {
          id: FAQ_PAGE_ID,
          isEnabled: false,
          cover: null,
          translations: [{ locale: 'FR_FR', title: 'FAQ modifiée', body: '<p>Nouveau contenu</p>' }],
        },
      },
      'internal_admin',
    )

    expect(updatePage.errorCode).toBeNull()

    const { customPage } = await graphql(CustomPageQuery, { id: FAQ_PAGE_ID }, 'internal_admin')
    expect(customPage.isEnabled).toBe(false)
    expect(customPage.cover).toBeNull()
    expect(byLocale(customPage.translations).map(({ locale, title }) => ({ locale, title }))).toEqual([
      { locale: 'en-GB', title: 'FAQ EN' },
      { locale: 'fr-FR', title: 'FAQ modifiée' },
    ])
  })

  it('deletes the requested translations but never the default locale one', async () => {
    const { updatePage } = await graphql(
      UpdatePageMutation,
      {
        input: {
          id: FAQ_PAGE_ID,
          translations: [{ locale: 'FR_FR', title: 'FAQ FR', body: '<p>Contenu</p>' }],
          deletedTranslationLocales: ['EN_GB', 'FR_FR'],
        },
      },
      'internal_admin',
    )

    expect(updatePage.errorCode).toBeNull()

    const { customPage } = await graphql(CustomPageQuery, { id: FAQ_PAGE_ID }, 'internal_admin')
    expect(customPage.translations.map(({ locale, title }) => ({ locale, title }))).toEqual([
      { locale: 'fr-FR', title: 'FAQ FR' },
    ])
  })

  it('deletes a page', async () => {
    const { deletePage } = await graphql(DeletePageMutation, { input: { id: FAQ_PAGE_ID } }, 'internal_admin')

    expect(deletePage).toEqual({ deletedPageId: FAQ_PAGE_ID, errorCode: null })
    const { customPage } = await graphql(CustomPageQuery, { id: FAQ_PAGE_ID }, 'internal_admin')
    expect(customPage).toBeNull()
  })

  it('returns NOT_FOUND when deleting an unknown page', async () => {
    const unknownId = toGlobalId('Page', 'unknownPage')
    const { deletePage } = await graphql(DeletePageMutation, { input: { id: unknownId } }, 'internal_admin')

    expect(deletePage).toEqual({ deletedPageId: null, errorCode: 'NOT_FOUND' })
  })

  it('denies the mutations to a non-admin user', async () => {
    await expect(graphql(DeletePageMutation, { input: { id: FAQ_PAGE_ID } }, 'internal_user')).rejects.toThrowError(
      'Access denied to this field.',
    )
  })
})
