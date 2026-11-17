import { normalizeLegacyTableBorders } from './normalizeLegacyTableBorders'
import { Jodit } from 'jodit-react'

/**
 * @jest-status compliant
 * @jest-reason Verifies legacy table conversion without changing transparent grids or existing styles.
 */
describe('Legacy table borders in Jodit', () => {
  it('keeps the converted class in the HTML returned by Jodit', () => {
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    const editor = Jodit.make(textarea, {
      events: { beforeSetValueToEditor: normalizeLegacyTableBorders },
    })
    try {
      editor.value = '<table border="1"><tbody><tr><td>Content</td></tr></tbody></table>'
      const result = document.createElement('template')
      result.innerHTML = editor.value
      expect(result.content.querySelector('table')?.className).toBe('table')
      expect(result.content.querySelector('table')?.hasAttribute('border')).toBe(false)
      expect(result.content.querySelector('td')?.textContent).toBe('Content')
    } finally {
      editor.destruct()
      textarea.remove()
    }
  })

  it.each(['1', '2'])('marks a table with border="%s" as a visible table', border => {
    const value = `<table border="${border}" class="custom" style="width: 100%"><tbody><tr><td>Content</td></tr></tbody></table>`
    expect(normalizeLegacyTableBorders(value)).toBe(
      '<table class="custom table" style="width: 100%"><tbody><tr><td>Content</td></tr></tbody></table>',
    )
  })

  it.each([
    undefined,
    '',
    '<p>Text &amp; content</p>',
    '<table><tbody><tr><td>Grid</td></tr></tbody></table>',
    '<table border="0"><tbody><tr><td>Grid</td></tr></tbody></table>',
    '<table class="table custom"><tbody><tr><td>Table</td></tr></tbody></table>',
    '<table style="border: 2px solid red"><tbody><tr><td>Table</td></tr></tbody></table>',
  ])('preserves content that does not need conversion: %s', value => {
    expect(normalizeLegacyTableBorders(value)).toBe(value)
  })

  it('converts only the bordered table inside a transparent layout and is idempotent', () => {
    const value =
      '<table border="0"><tbody><tr><td><table border="1"><tbody><tr><td>Content</td></tr></tbody></table></td></tr></tbody></table>'
    const result = normalizeLegacyTableBorders(value)
    expect(result).toBe(value.replace('border="1"', 'class="table"'))
    expect(normalizeLegacyTableBorders(result)).toBe(result)
  })
})
