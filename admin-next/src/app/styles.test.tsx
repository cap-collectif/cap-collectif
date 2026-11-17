/**
 * @jest-environment-options {"customExportConditions": ["node", "node-addons"]}
 */
/* eslint-env jest */
import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { getTheme } from '@shared/navbar/NavBar.utils'
import { GlobalFrontOfficeCKEDITORStyles } from './styles'

/**
 * @jest-status compliant
 * @jest-reason Checks computed table borders with the real shared stylesheet and content renderer.
 */
describe('Front office rich text table borders', () => {
  it.each([
    ['layout grid', '', '', '0px'],
    ['CKEditor layout grid', 'border="0"', '', '0px'],
    ['CKEditor table', 'border="1"', '', '1px'],
    ['CKEditor table with a larger border', 'border="2"', '', '1px'],
    ['explicit table', 'class="table"', '', '1px'],
    ['custom inline borders', '', 'style="border: 2px solid red"', '2px'],
  ])('renders %s borders', (_name, tableAttributes, cellAttributes, expectedWidth) => {
    const sheet = new ServerStyleSheet()
    try {
      renderToStaticMarkup(sheet.collectStyles(<GlobalFrontOfficeCKEDITORStyles {...getTheme([])} />))
      render(
        <>
          {/* Match the UI reset used by the front office. */}
          <style>{'* { border-width: 0; border-style: solid; }'}</style>
          {sheet.getStyleElement()}
          <WYSIWYGRender
            className="old-editor"
            value={`<table ${tableAttributes}><thead><tr><th ${cellAttributes}>Heading</th></tr></thead><tbody><tr><td ${cellAttributes}>Content</td></tr></tbody></table>`}
          />
        </>,
      )

      for (const role of ['columnheader', 'cell']) {
        expect(getComputedStyle(screen.getByRole(role)).borderTopWidth).toBe(expectedWidth)
      }
    } finally {
      sheet.seal()
    }
  })
})
