import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { useLazyLoadQuery } from 'react-relay'
import { CapUIProvider } from '@cap-collectif/ui'
import Sitemap from './Sitemap'

jest.mock('react-intl', () => ({ useIntl: () => ({ formatMessage: ({ id }) => id }) }))
jest.mock('react-relay', () => ({ graphql: jest.fn(), useLazyLoadQuery: jest.fn() }))
jest.mock('@components/BackOffice/AppProvider/App.context', () => ({
  useAppContext: () => ({ siteColors: { linkColor: '#c00', linkHoverColor: '#900' } }),
}))

it('keeps breadcrumb and footer current-page indications distinct and omits unnamed links', () => {
  ;(useLazyLoadQuery as jest.Mock).mockReturnValue({
    sitemap: {
      homeUrl: '/',
      sitemapUrl: '/sitemap',
      legalUrls: { cookies: '/cookies' },
      footerLegals: { cookies: true, privacy: false, legal: false },
      headerItems: [
        {
          title: 'Menu',
          link: '/menu',
          hasEnabledFeature: true,
          children: [
            { title: ' ', link: '/unnamed-child', hasEnabledFeature: true },
            { title: 'Child', link: '/child', hasEnabledFeature: true },
          ],
        },
        { title: null, link: '/unnamed', hasEnabledFeature: true, children: [] },
      ],
      projects: [{ title: 'Project', url: '/project', steps: [{ title: '', url: '/unnamed-step' }] }],
      footerLinks: [
        { name: 'Sitemap', url: '/sitemap' },
        { name: 'Footer menu link', url: '/footer-page' },
        { name: '', url: '/unnamed-footer' },
      ],
      footerSocialNetworks: [{ title: 'Social network', link: 'https://example.com/social' }],
      footerBody: 'Free footer content',
    },
  })

  render(
    <CapUIProvider>
      <Sitemap />
    </CapUIProvider>,
  )
  const breadcrumb = screen.getByRole('navigation', { name: 'navbar.breadcrumb' })
  expect(within(breadcrumb).getAllByRole('listitem')).toHaveLength(2)
  expect(within(breadcrumb).getByText('sitemap.title').getAttribute('aria-current')).toBe('page')
  const separator = within(breadcrumb).getByText('›')
  expect(separator.getAttribute('aria-hidden')).toBe('true')
  expect(getComputedStyle(separator).marginRight).toBe('0.57142857rem')
  expect(getComputedStyle(screen.getByRole('heading', { level: 1 })).borderBottomColor).toBe('#dddddd')
  expect(screen.getByRole('link', { name: 'Sitemap' }).getAttribute('aria-current')).toBe('page')
  expect(screen.getByRole('link', { name: 'Child' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'cookies' }).getAttribute('href')).toBe('/cookies')
  expect(screen.getByRole('link', { name: 'Footer menu link' }).getAttribute('href')).toBe('/footer-page')
  expect(screen.queryByRole('link', { name: 'Social network' })).toBeNull()
  expect(screen.queryByText('Free footer content')).toBeNull()
  expect(screen.getAllByRole('link').every(element => element.textContent.trim().length > 0)).toBe(true)
})
