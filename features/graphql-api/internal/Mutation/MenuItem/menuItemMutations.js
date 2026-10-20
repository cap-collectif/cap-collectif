/* eslint-env jest */
import '../../../_setupDB'

// Fixtures used (fixtures/Dev/MenuItem.yaml): "Contact" is a mandatory item (neither deletable nor fully
// modifiable, link "contact"), "Lien externe" is a deletable item, "FAQ" links to the custom page "page1".
const MenuItemsQuery = /* GraphQL */ `
  query {
    adminMenuItems(first: 100) {
      edges {
        node {
          id
          translations {
            locale
            title
          }
        }
      }
    }
    pages {
      id
      title
    }
  }
`

const MenuItemFragment = /* GraphQL */ `
  fragment MenuItemFields on MenuItem {
    id
    menu
    position
    isEnabled
    isExternalLink
    parent {
      id
    }
    page {
      id
    }
    translations {
      locale
      title
      link
    }
  }
`

const CreateMenuItemMutation = /* GraphQL */ `
  ${MenuItemFragment}
  mutation ($input: CreateMenuItemInput!) {
    createMenuItem(input: $input) {
      menuItem {
        ...MenuItemFields
      }
      errorCode
    }
  }
`

const UpdateMenuItemMutation = /* GraphQL */ `
  ${MenuItemFragment}
  mutation ($input: UpdateMenuItemInput!) {
    updateMenuItem(input: $input) {
      menuItem {
        ...MenuItemFields
      }
      errorCode
    }
  }
`

const DeleteMenuItemMutation = /* GraphQL */ `
  mutation ($input: DeleteMenuItemInput!) {
    deleteMenuItem(input: $input) {
      deletedMenuItemId
      errorCode
    }
  }
`

const MenuItemQuery = /* GraphQL */ `
  ${MenuItemFragment}
  query ($id: ID!) {
    menuItem(id: $id) {
      ...MenuItemFields
    }
  }
`

const getFixtures = async () => {
  const { adminMenuItems, pages } = await graphql(MenuItemsQuery, {}, 'internal_admin')
  const findMenuItemId = title =>
    adminMenuItems.edges
      .map(edge => edge.node)
      .find(node => node.translations.some(translation => translation.title === title)).id

  return {
    contactId: findMenuItemId('Contact'),
    deletableId: findMenuItemId('Lien externe'),
    aboutId: findMenuItemId('À propos'),
    page: pages.find(page => page.title === 'FAQ FR'),
  }
}

const baseInput = {
  menu: 'HEADER',
  position: 1,
  isEnabled: true,
  isExternalLink: false,
}

const getLink = (menuItem, locale) => menuItem.translations.find(translation => translation.locale === locale)?.link

describe('Internal|menuItem mutations', () => {
  it('denies the menu item administration to a non-admin user', async () => {
    await expect(graphql(MenuItemsQuery, {}, 'internal_user')).rejects.toThrowError('Access denied to this field.')
    await expect(
      graphql(
        CreateMenuItemMutation,
        { input: { ...baseInput, translations: [{ locale: 'FR_FR', title: 'Forbidden' }] } },
        'internal_user',
      ),
    ).rejects.toThrowError('Access denied to this field.')
  })

  it('creates a sub menu item with an external link', async () => {
    const { aboutId } = await getFixtures()

    const { createMenuItem } = await graphql(
      CreateMenuItemMutation,
      {
        input: {
          ...baseInput,
          parent: aboutId,
          isExternalLink: true,
          translations: [{ locale: 'FR_FR', title: 'Centre d’aide', link: 'https://help.example.com' }],
        },
      },
      'internal_admin',
    )

    expect(createMenuItem.errorCode).toBeNull()
    const { menuItem } = await graphql(MenuItemQuery, { id: createMenuItem.menuItem.id }, 'internal_admin')
    expect(menuItem).toMatchObject({
      menu: 'HEADER',
      isExternalLink: true,
      parent: { id: aboutId },
      page: null,
      translations: [{ locale: 'fr-FR', title: 'Centre d’aide', link: 'https://help.example.com' }],
    })
  })

  it('requires a title in the platform default locale', async () => {
    const { createMenuItem } = await graphql(
      CreateMenuItemMutation,
      { input: { ...baseInput, translations: [{ locale: 'EN_GB', title: 'English only' }] } },
      'internal_admin',
    )

    expect(createMenuItem).toEqual({ menuItem: null, errorCode: 'TITLE_REQUIRED' })
  })

  it('requires a title in another locale when a link is set', async () => {
    const { createMenuItem } = await graphql(
      CreateMenuItemMutation,
      {
        input: {
          ...baseInput,
          translations: [
            { locale: 'FR_FR', title: 'Titre', link: 'https://example.com/fr' },
            { locale: 'EN_GB', title: '', link: 'https://example.com/en' },
          ],
        },
      },
      'internal_admin',
    )

    expect(createMenuItem).toEqual({ menuItem: null, errorCode: 'TITLE_REQUIRED' })
  })

  it('does not persist a rejected update when a subsequent mutation flushes', async () => {
    const { deletableId } = await getFixtures()
    const { menuItem: original } = await graphql(MenuItemQuery, { id: deletableId }, 'internal_admin')

    const response = await graphql(
      /* GraphQL */ `
        mutation ($invalidInput: UpdateMenuItemInput!, $validInput: CreateMenuItemInput!) {
          rejected: updateMenuItem(input: $invalidInput) {
            errorCode
          }
          accepted: createMenuItem(input: $validInput) {
            errorCode
          }
        }
      `,
      {
        invalidInput: {
          ...baseInput,
          id: deletableId,
          isEnabled: !original.isEnabled,
          translations: [
            { locale: 'FR_FR', title: 'Rejected title', link: 'https://example.com/rejected' },
            { locale: 'EN_GB', title: '', link: 'https://example.com/en' },
          ],
        },
        validInput: {
          ...baseInput,
          menu: 'FOOTER',
          position: 9999,
          translations: [{ locale: 'FR_FR', title: 'Flush trigger' }],
        },
      },
      'internal_admin',
    )

    expect(response).toEqual({ rejected: { errorCode: 'TITLE_REQUIRED' }, accepted: { errorCode: null } })
    const { menuItem } = await graphql(MenuItemQuery, { id: deletableId }, 'internal_admin')
    expect(menuItem.isEnabled).toBe(original.isEnabled)
    expect(menuItem.translations).toEqual(original.translations)
  })

  it('removes the translation of another locale whose title is emptied', async () => {
    const { createMenuItem } = await graphql(
      CreateMenuItemMutation,
      {
        input: {
          ...baseInput,
          translations: [
            { locale: 'FR_FR', title: 'Aide', link: 'https://example.com/fr' },
            { locale: 'EN_GB', title: 'Help', link: 'https://example.com/en' },
          ],
        },
      },
      'internal_admin',
    )
    const { id } = createMenuItem.menuItem

    const { updateMenuItem } = await graphql(
      UpdateMenuItemMutation,
      {
        input: {
          ...baseInput,
          id,
          translations: [
            { locale: 'FR_FR', title: 'Aide', link: 'https://example.com/fr' },
            { locale: 'EN_GB', title: '', link: '' },
          ],
        },
      },
      'internal_admin',
    )

    expect(updateMenuItem.errorCode).toBeNull()
    const { menuItem } = await graphql(MenuItemQuery, { id }, 'internal_admin')
    expect(menuItem.translations).toEqual([{ locale: 'fr-FR', title: 'Aide', link: 'https://example.com/fr' }])
  })

  it('does not keep the external link flag without link', async () => {
    const { createMenuItem } = await graphql(
      CreateMenuItemMutation,
      {
        input: {
          ...baseInput,
          menu: 'FOOTER',
          isExternalLink: true,
          translations: [{ locale: 'FR_FR', title: 'No link' }],
        },
      },
      'internal_admin',
    )

    expect(createMenuItem.errorCode).toBeNull()
    expect(createMenuItem.menuItem.isExternalLink).toBe(false)
  })

  it('computes the link from the custom page and ignores the submitted link', async () => {
    const { deletableId, page } = await getFixtures()

    const { updateMenuItem } = await graphql(
      UpdateMenuItemMutation,
      {
        input: {
          ...baseInput,
          id: deletableId,
          page: page.id,
          isExternalLink: true,
          translations: [{ locale: 'FR_FR', title: 'Lien externe', link: 'https://ignored.example.com' }],
        },
      },
      'internal_admin',
    )

    expect(updateMenuItem.errorCode).toBeNull()
    const { menuItem } = await graphql(MenuItemQuery, { id: deletableId }, 'internal_admin')
    expect(menuItem.page).toEqual({ id: page.id })
    expect(menuItem.isExternalLink).toBe(false)
    expect(getLink(menuItem, 'fr-FR')).toBe('pages/faq')
  })

  it('keeps the link of a mandatory item, including for a new translation', async () => {
    const { contactId, page } = await getFixtures()

    const { updateMenuItem } = await graphql(
      UpdateMenuItemMutation,
      {
        input: {
          ...baseInput,
          id: contactId,
          page: page.id,
          translations: [
            { locale: 'FR_FR', title: 'Nous contacter', link: 'changed' },
            { locale: 'EN_GB', title: 'Contact us', link: 'changed' },
          ],
        },
      },
      'internal_admin',
    )

    expect(updateMenuItem.errorCode).toBeNull()
    const { menuItem } = await graphql(MenuItemQuery, { id: contactId }, 'internal_admin')
    expect(menuItem.page).toBeNull()
    expect(getLink(menuItem, 'fr-FR')).toBe('contact')
    expect(getLink(menuItem, 'en-GB')).toBe('contact')
    expect(menuItem.translations.find(translation => translation.locale === 'fr-FR').title).toBe('Nous contacter')
  })

  it('refuses an item as its own parent', async () => {
    const { deletableId } = await getFixtures()

    const { updateMenuItem } = await graphql(
      UpdateMenuItemMutation,
      {
        input: { ...baseInput, id: deletableId, parent: deletableId, translations: [{ locale: 'FR_FR', title: 'x' }] },
      },
      'internal_admin',
    )

    expect(updateMenuItem).toEqual({ menuItem: null, errorCode: 'PARENT_NOT_FOUND' })
  })

  it('refuses a parent that cannot hold sub menus', async () => {
    const { deletableId, aboutId, contactId } = await getFixtures()
    const update = input =>
      graphql(
        UpdateMenuItemMutation,
        { input: { ...baseInput, translations: [{ locale: 'FR_FR', title: 'x' }], ...input } },
        'internal_admin',
      )

    // "Contact" is a sub menu: the navigation bar displays a single level
    await expect(update({ id: deletableId, parent: contactId })).resolves.toEqual({
      updateMenuItem: { menuItem: null, errorCode: 'INVALID_PARENT' },
    })
    // The footer has no sub menus
    await expect(update({ id: deletableId, menu: 'FOOTER', parent: aboutId })).resolves.toEqual({
      updateMenuItem: { menuItem: null, errorCode: 'INVALID_PARENT' },
    })
  })

  it('refuses a parent for an item that holds sub menus', async () => {
    const { aboutId } = await getFixtures()
    const { menuItemParents } = await graphql('query { menuItemParents { id } }', {}, 'internal_admin')
    const otherParent = menuItemParents.find(parent => parent.id !== aboutId)

    const { updateMenuItem } = await graphql(
      UpdateMenuItemMutation,
      {
        input: {
          ...baseInput,
          id: aboutId,
          parent: otherParent.id,
          translations: [{ locale: 'FR_FR', title: 'À propos' }],
        },
      },
      'internal_admin',
    )

    expect(updateMenuItem).toEqual({ menuItem: null, errorCode: 'INVALID_PARENT' })
  })

  it('deletes a deletable item', async () => {
    const { deletableId } = await getFixtures()

    await expect(graphql(DeleteMenuItemMutation, { input: { id: deletableId } }, 'internal_admin')).resolves.toEqual({
      deleteMenuItem: { deletedMenuItemId: deletableId, errorCode: null },
    })
    await expect(graphql(MenuItemQuery, { id: deletableId }, 'internal_admin')).resolves.toEqual({ menuItem: null })
  })

  it('refuses to delete a mandatory item', async () => {
    const { contactId } = await getFixtures()

    await expect(graphql(DeleteMenuItemMutation, { input: { id: contactId } }, 'internal_admin')).resolves.toEqual({
      deleteMenuItem: { deletedMenuItemId: null, errorCode: 'NOT_DELETABLE' },
    })
    await expect(graphql(MenuItemQuery, { id: contactId }, 'internal_admin')).resolves.toMatchObject({
      menuItem: { id: contactId },
    })
  })
})
