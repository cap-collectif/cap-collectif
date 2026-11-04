import React from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { IntlProvider } from 'react-intl'
import { Post } from './Post'

/**
 * @jest-status compliant
 * @jest-reason Checks visible post and author links in the DOM for active, anonymized and missing authors.
 */
describe('Blog post authors', () => {
  let container: HTMLDivElement
  let root: Root
  const reactTestEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
  let originalActEnvironment: boolean | undefined
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    originalActEnvironment = reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT
    reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true
    root = createRoot(container)
  })

  afterEach(() => {
    try {
      act(() => root.unmount())
    } finally {
      container.remove()
      if (originalActEnvironment === undefined) delete reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT
      else reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment
    }
  })

  test.each([
    ['Alice', '/profile/alice', true, true],
    ['Collective', '/organization/collective', true, true],
    ['Profil anonymisé', '', true, false],
    ['Alice', '/profile/alice', false, false],
    [null, null, true, false],
  ])('renders author %s with URL %s and profiles enabled %s', (name, url, profiles, linked) => {
    const post = {
      ' $fragmentType': 'Post_post' as const,
      title: 'Local news',
      publishedAt: '2026-10-20T08:00:00Z',
      media: null,
      abstract: 'News summary',
      url: '/blog/news',
      themes: [],
      authors: name ? [{ displayName: name, url }] : [],
    }
    act(() =>
      root.render(
        <IntlProvider locale="en" messages={{ 'global.byAuthor': 'by {author}' }}>
          <Post features={{ profiles }} post={post} />
        </IntlProvider>,
      ),
    )
    expect(container.querySelector('h3 a')?.getAttribute('href')).toBe('/blog/news')
    if (name) expect(container.textContent).toContain(name)
    const authorLinks = Array.from(container.querySelectorAll('a')).filter(link => link.textContent === name)
    expect(authorLinks).toHaveLength(linked ? 1 : 0)
    if (linked) expect(authorLinks[0].getAttribute('href')).toBe(url)
  })
})
