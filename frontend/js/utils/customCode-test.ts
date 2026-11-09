/* eslint-env jest */
import { insertCustomCode } from './customCode'

describe('insertCustomCode', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('loads external scripts with their attributes', () => {
    insertCustomCode('<script async src="//www.instagram.com/embed.js"></script>')

    const scripts = document.querySelectorAll('#capcoCustomCodeWrapper script')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].getAttribute('src')).toBe('//www.instagram.com/embed.js')
    expect(scripts[0].hasAttribute('async')).toBe(true)
  })

  it('loads every script and style of the custom code', () => {
    insertCustomCode(
      '<style>.foo { color: red; }</style><script async src="https://www.tiktok.com/embed.js"></script><script async src="//www.instagram.com/embed.js"></script>',
    )

    const wrapper = document.getElementById('capcoCustomCodeWrapper')
    expect(wrapper?.querySelectorAll('style')).toHaveLength(1)
    expect(Array.from(wrapper?.querySelectorAll('script') ?? []).map(script => script.getAttribute('src'))).toEqual([
      'https://www.tiktok.com/embed.js',
      '//www.instagram.com/embed.js',
    ])
  })

  it('replaces the previous custom code', () => {
    insertCustomCode('<script src="https://example.com/first.js"></script>')
    insertCustomCode('<script src="https://example.com/second.js"></script>')

    const scripts = document.querySelectorAll('#capcoCustomCodeWrapper script')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].getAttribute('src')).toBe('https://example.com/second.js')
  })
})
