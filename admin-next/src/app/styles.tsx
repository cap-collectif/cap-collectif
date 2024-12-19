import { GlobalTheme } from '@shared/navbar/NavBar.utils'
import { createGlobalStyle, css } from 'styled-components'

export const GlobalFrontOfficeStyles = createGlobalStyle<GlobalTheme>`
  ${({ h1Color, h2Color, h3Color, h4Color, h5Color, linkColor, linkHoverColor }) => css`
    h1 {
      color: ${h1Color};
      font-size: ${36 / 14}rem;
    }
    h2 {
      color: ${h2Color};
      font-size: ${30 / 14}rem;
    }
    h3 {
      color: ${h3Color};
      font-size: ${24 / 14}rem;
    }
    h4 {
      color: ${h4Color};
      font-size: ${18 / 14}rem;
    }
    h5 {
      color: ${h5Color};
      font-size: ${14 / 14}rem;
    }

    .old-editor ul,
    .wysiwyg-render ul,
    .old-editor ol,
    .wysiwyg-render ol {
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: ${40 / 14}rem;
    }

    a {
      color: ${linkColor};
      &:hover {
        color: ${linkHoverColor};
        text-decoration: underline;
      }
    }

    .sr-only {
      border: 0 !important;
      clip: rect(1px, 1px, 1px, 1px) !important;
      -webkit-clip-path: inset(50%) !important;
      clip-path: inset(50%) !important;
      height: 1px !important;
      overflow: hidden !important;
      padding: 0 !important;
      position: absolute !important;
      width: 1px !important;
      white-space: nowrap !important;
    }
  `}
`
