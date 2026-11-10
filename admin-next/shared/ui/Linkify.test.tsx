/* eslint-env jest */
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import Linkify from './Linkify'

/**
 * @jest-status compliant
 * @jest-reason Checks the links visible in the DOM through their accessible role and name.
 */
describe('<Linkify />', () => {
  it('renders the URLs of a text as links opening in a new tab', () => {
    const { container } = render(<Linkify>See https://cap-collectif.com now</Linkify>)

    const link = screen.getByRole('link', { name: 'https://cap-collectif.com' })
    expect(link.getAttribute('href')).toBe('https://cap-collectif.com')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(container.textContent).toBe('See https://cap-collectif.com now')
  })

  it('wraps the content in a span with the Linkify class by default', () => {
    const { container } = render(<Linkify>Text</Linkify>)

    expect(container.innerHTML).toBe('<span class="Linkify">Text</span>')
  })

  it('applies a custom wrapper class name', () => {
    const { container } = render(<Linkify className="custom">Text</Linkify>)

    expect(container.innerHTML).toBe('<span class="custom">Text</span>')
  })

  it('applies the link class name', () => {
    render(<Linkify linkClassName="external-link">www.example.org</Linkify>)

    expect(screen.getByRole('link', { name: 'www.example.org' }).className).toBe('external-link')
  })

  it('renders emails as mailto links', () => {
    render(<Linkify>Contact: contact@cap-collectif.com</Linkify>)

    expect(screen.getByRole('link', { name: 'contact@cap-collectif.com' }).getAttribute('href')).toBe(
      'mailto:contact@cap-collectif.com',
    )
  })

  it('detects URLs inside nested elements and keeps line breaks', () => {
    const { container } = render(
      <Linkify>
        {['First https://a.example', <br key="br" />, 'Second']}
        <strong>Bold www.cap-collectif.com</strong>
      </Linkify>,
    )

    expect(screen.getByRole('link', { name: 'https://a.example' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'www.cap-collectif.com' }).closest('strong')).not.toBeNull()
    expect(container.querySelectorAll('br')).toHaveLength(1)
  })

  it('does not wrap an existing link in another link', () => {
    render(
      <Linkify>
        <a href="https://example.com">https://example.com</a>
      </Linkify>,
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0].getAttribute('target')).toBeNull()
  })

  it('links bare domains with the http protocol', () => {
    render(<Linkify>Site : cap-collectif.com</Linkify>)

    expect(screen.getByRole('link', { name: 'cap-collectif.com' }).getAttribute('href')).toBe(
      'http://cap-collectif.com',
    )
  })

  it('does not detect URLs inside a button', () => {
    render(
      <Linkify>
        <button type="button">https://example.com</button>
      </Linkify>,
    )

    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByRole('button', { name: 'https://example.com' })).toBeDefined()
  })

  it('renders a text without URL unchanged', () => {
    const { container } = render(<Linkify>Plain text</Linkify>)

    expect(screen.queryByRole('link')).toBeNull()
    expect(container.textContent).toBe('Plain text')
  })
})
