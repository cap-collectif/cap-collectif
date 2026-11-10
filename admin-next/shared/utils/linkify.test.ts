import linkify from './linkify'

/**
 * @jest-status compliant
 * @jest-reason Checks the public tokenization contract with explicit inputs and expected tokens.
 */
describe('linkify', () => {
  it('returns a single text token when the text has no URL', () => {
    expect(linkify('No link here, rapport.pdf nor contact@example')).toEqual([
      { type: 'text', value: 'No link here, rapport.pdf nor contact@example' },
    ])
  })

  it('returns no token for an empty text', () => {
    expect(linkify('')).toEqual([])
  })

  it('splits the text around the detected URLs', () => {
    expect(linkify('See https://cap-collectif.com and www.example.org/page?a=1 now')).toEqual([
      { type: 'text', value: 'See ' },
      { type: 'link', value: 'https://cap-collectif.com', href: 'https://cap-collectif.com' },
      { type: 'text', value: ' and ' },
      { type: 'link', value: 'www.example.org/page?a=1', href: 'http://www.example.org/page?a=1' },
      { type: 'text', value: ' now' },
    ])
  })

  it.each([
    { text: 'cap-collectif.com', href: 'http://cap-collectif.com' },
    { text: 'budgetparticipatif.paris', href: 'http://budgetparticipatif.paris' },
    { text: 'drive.google.com/drive/folders/1AbC', href: 'http://drive.google.com/drive/folders/1AbC' },
    { text: 'пример.рф', href: 'http://пример.рф' },
    { text: 'l214.com', href: 'http://l214.com' },
  ])('links the bare domain $text with the http protocol', ({ text, href }) => {
    expect(linkify(text)).toEqual([{ type: 'link', value: text, href }])
  })

  it.each([
    { name: 'a final period', text: 'Go to https://example.com.', url: 'https://example.com', rest: '.' },
    { name: 'a comma', text: 'Go to https://example.com, then', url: 'https://example.com', rest: ', then' },
    { name: 'a wrapping parenthesis', text: '(https://example.com/a)', url: 'https://example.com/a', rest: ')' },
    { name: 'a closing quote', text: '“https://example.com”', url: 'https://example.com', rest: '”' },
  ])('excludes $name from the URL', ({ text, url, rest }) => {
    const tokens = linkify(text)

    expect(tokens).toContainEqual({ type: 'link', value: url, href: url })
    expect(tokens[tokens.length - 1]).toEqual({ type: 'text', value: rest })
  })

  it('keeps a parenthesis belonging to the URL', () => {
    expect(linkify('https://en.wikipedia.org/wiki/Foo_(bar)')).toEqual([
      {
        type: 'link',
        value: 'https://en.wikipedia.org/wiki/Foo_(bar)',
        href: 'https://en.wikipedia.org/wiki/Foo_(bar)',
      },
    ])
  })

  it('turns emails into mailto links', () => {
    expect(linkify('Write to jane.doe+news@cap-collectif.co.uk.')).toEqual([
      { type: 'text', value: 'Write to ' },
      {
        type: 'link',
        value: 'jane.doe+news@cap-collectif.co.uk',
        href: 'mailto:jane.doe+news@cap-collectif.co.uk',
      },
      { type: 'text', value: '.' },
    ])
  })

  it('does not detect an email inside a URL', () => {
    expect(linkify('https://example.com/users/jane@example.com')).toEqual([
      {
        type: 'link',
        value: 'https://example.com/users/jane@example.com',
        href: 'https://example.com/users/jane@example.com',
      },
    ])
  })

  it.each([
    { text: 'ftp://example.com/file', href: 'ftp://example.com/file' },
    { text: 'mailto:contact@cap-collectif.com', href: 'mailto:contact@cap-collectif.com' },
    { text: '//cdn.example.com/script.js', href: '//cdn.example.com/script.js' },
  ])('links $text with its explicit protocol', ({ text, href }) => {
    expect(linkify(text)).toEqual([{ type: 'link', value: text, href }])
  })

  it.each(['javascript:alert(1)', 'www.example', 'https://-example.com', 'image.png', 'www. or https://.'])(
    'does not create a link from %s',
    text => {
      expect(linkify(text).some(token => token.type === 'link')).toBe(false)
    },
  )
})
