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

    .wysiwyg-render ul,
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

    .sr-only,
    #ads-code,
    #analytics-code,
    #custom-page-code,
    #custom-code {
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

/**
 * TODO Supprimer lorsque l'on se passera de CKEditor
 * Contient le strict minimum pour que les boutons et les grilles de boostraps fonctionnent encore
 * À n'utiliser que dans les pages ou c'est nécessaire
 */
export const GlobalFrontOfficeCKEDITORStyles = createGlobalStyle<GlobalTheme>`
  ${({ primaryColor, primaryLabel, primaryTransparentColor, primaryHoverColor }) => css`
    .old-editor {
      font-size: ${16 / 14}rem;
    }

    .old-editor h1 {
      margin-top: 0;
      margin-bottom: 30px;
    }

    .old-editor h2 {
      margin-top: 30px;
      margin-bottom: 20px;
    }

    .old-editor h3 {
      margin-top: 10px;
      margin-bottom: 10px;
    }

    .old-editor h4 {
      margin-top: 20px;
      margin-bottom: 10px;
    }

    .old-editor h5,
    .old-editor h6 {
      margin-top: 10px;
      margin-bottom: 10px;
    }

    .old-editor ul,
    .old-editor ol {
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: ${40 / 14}rem;
    }

    .old-editor table,
    .old-editor td,
    .old-editorth {
      border-width: 1px;
    }

    .old-editor img,
    .old-editor svg,
    .old-editor video,
    .old-editor canvas,
    .old-editor audio,
    .old-editor iframe,
    .old-editor embed,
    .old-editor object {
      display: inline;
    }

    .btgrid [class*='col-'] {
      margin-bottom: 15px;

      @media (min-width: 767px) {
        margin-bottom: 30px;
      }
    }
    .btn {
      display: inline-block;
      margin-bottom: 0;
      font-weight: 400;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      touch-action: manipulation;
      cursor: pointer;
      background-image: none;
      border: 1px solid transparent;
      padding: 6px 12px;
      font-size: 14px;
      line-height: 1.428571429;
      border-radius: 4px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .btn-lg {
      padding: 10px 16px;
      font-size: 18px;
      line-height: 1.3333333;
      border-radius: 6px;
    }

    .btn-sm {
      padding: 5px 10px;
      font-size: 12px;
      line-height: 1.5;
      border-radius: 3px;
    }

    .btn-xs {
      padding: 1px 5px;
      font-size: 12px;
      line-height: 1.5;
      border-radius: 3px;
    }

    .btn-primary,
    .btn-primary:hover {
      text-decoration: none;
      color: ${primaryLabel};
      background-color: ${primaryColor};
      border-color: ${primaryColor};
    }

    .btn--outline.btn-primary {
      color: ${primaryTransparentColor};
      background-color: transparent;
      border-color: ${primaryTransparentColor};
    }

    .btn--outline.btn-primary:hover {
      color: ${primaryHoverColor};
      background-color: ${primaryTransparentColor};
      border-color: ${primaryHoverColor};
    }

    .old-editor .container {
      margin-right: auto;
      margin-left: auto;
      padding-right: 15px;
      padding-left: 15px;
    }

    @media (min-width: 576px) {
      .old-editor .container {
        width: 540px;
        max-width: 100%;
      }
    }

    @media (min-width: 768px) {
      .old-editor .container {
        width: 720px;
      }
    }

    @media (min-width: 992px) {
      .old-editor .container {
        width: 960px;
      }
    }

    @media (min-width: 1200px) {
      .old-editor .container {
        width: 1140px;
      }
    }

    .row {
      margin-right: -15px;
      margin-left: -15px;
    }

    @media (min-width: 992px) {
      .row {
        display: flex;
      }
    }

    .col-1,
    .col-2,
    .col-3,
    .col-4,
    .col-5,
    .col-6,
    .col-7,
    .col-8,
    .col-9,
    .col-10,
    .col-11,
    .col-12,
    .col,
    .col-auto,
    .col-sm-1,
    .col-sm-2,
    .col-sm-3,
    .col-sm-4,
    .col-sm-5,
    .col-sm-6,
    .col-sm-7,
    .col-sm-8,
    .col-sm-9,
    .col-sm-10,
    .col-sm-11,
    .col-sm-12,
    .col-sm,
    .col-sm-auto,
    .col-md-1,
    .col-md-2,
    .col-md-3,
    .col-md-4,
    .col-md-5,
    .col-md-6,
    .col-md-7,
    .col-md-8,
    .col-md-9,
    .col-md-10,
    .col-md-11,
    .col-md-12,
    .col-md,
    .col-md-auto,
    .col-lg-1,
    .col-lg-2,
    .col-lg-3,
    .col-lg-4,
    .col-lg-5,
    .col-lg-6,
    .col-lg-7,
    .col-lg-8,
    .col-lg-9,
    .col-lg-10,
    .col-lg-11,
    .col-lg-12,
    .col-lg,
    .col-lg-auto,
    .col-xl-1,
    .col-xl-2,
    .col-xl-3,
    .col-xl-4,
    .col-xl-5,
    .col-xl-6,
    .col-xl-7,
    .col-xl-8,
    .col-xl-9,
    .col-xl-10,
    .col-xl-11,
    .col-xl-12,
    .col-xl,
    .col-xl-auto {
      position: relative;
      width: 100%;
      min-height: 1px;
      padding-right: 15px;
      padding-left: 15px;
    }

    .col {
      flex-basis: 0;
      flex-grow: 1;
      max-width: 100%;
    }

    .col-auto {
      flex: 0 0 auto;
      width: auto;
      max-width: none;
    }

    .col-1 {
      flex: 0 0 8.333333%;
      max-width: 8.333333%;
    }

    .col-2 {
      flex: 0 0 16.666667%;
      max-width: 16.666667%;
    }

    .col-3 {
      flex: 0 0 25%;
      max-width: 25%;
    }

    .col-4 {
      flex: 0 0 33.333333%;
      max-width: 33.333333%;
    }

    .col-5 {
      flex: 0 0 41.666667%;
      max-width: 41.666667%;
    }

    .col-6 {
      flex: 0 0 50%;
      max-width: 50%;
    }

    .col-7 {
      flex: 0 0 58.333333%;
      max-width: 58.333333%;
    }

    .col-8 {
      flex: 0 0 66.666667%;
      max-width: 66.666667%;
    }

    .col-9 {
      flex: 0 0 75%;
      max-width: 75%;
    }

    .col-10 {
      flex: 0 0 83.333333%;
      max-width: 83.333333%;
    }

    .col-11 {
      flex: 0 0 91.666667%;
      max-width: 91.666667%;
    }

    .col-12 {
      flex: 0 0 100%;
      max-width: 100%;
    }

    @media (min-width: 576px) {
      .col-sm {
        flex-basis: 0;
        flex-grow: 1;
        max-width: 100%;
      }
      .col-sm-auto {
        flex: 0 0 auto;
        width: auto;
        max-width: none;
      }
      .col-sm-1 {
        flex: 0 0 8.333333%;
        max-width: 8.333333%;
      }
      .col-sm-2 {
        flex: 0 0 16.666667%;
        max-width: 16.666667%;
      }
      .col-sm-3 {
        flex: 0 0 25%;
        max-width: 25%;
      }
      .col-sm-4 {
        flex: 0 0 33.333333%;
        max-width: 33.333333%;
      }
      .col-sm-5 {
        flex: 0 0 41.666667%;
        max-width: 41.666667%;
      }
      .col-sm-6 {
        flex: 0 0 50%;
        max-width: 50%;
      }
      .col-sm-7 {
        flex: 0 0 58.333333%;
        max-width: 58.333333%;
      }
      .col-sm-8 {
        flex: 0 0 66.666667%;
        max-width: 66.666667%;
      }
      .col-sm-9 {
        flex: 0 0 75%;
        max-width: 75%;
      }
      .col-sm-10 {
        flex: 0 0 83.333333%;
        max-width: 83.333333%;
      }
      .col-sm-11 {
        flex: 0 0 91.666667%;
        max-width: 91.666667%;
      }
      .col-sm-12 {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }

    @media (min-width: 768px) {
      .col-md {
        flex-basis: 0;
        flex-grow: 1;
        max-width: 100%;
      }
      .col-md-auto {
        flex: 0 0 auto;
        width: auto;
        max-width: none;
      }
      .col-md-1 {
        flex: 0 0 8.333333%;
        max-width: 8.333333%;
      }
      .col-md-2 {
        flex: 0 0 16.666667%;
        max-width: 16.666667%;
      }
      .col-md-3 {
        flex: 0 0 25%;
        max-width: 25%;
      }
      .col-md-4 {
        flex: 0 0 33.333333%;
        max-width: 33.333333%;
      }
      .col-md-5 {
        flex: 0 0 41.666667%;
        max-width: 41.666667%;
      }
      .col-md-6 {
        flex: 0 0 50%;
        max-width: 50%;
      }
      .col-md-7 {
        flex: 0 0 58.333333%;
        max-width: 58.333333%;
      }
      .col-md-8 {
        flex: 0 0 66.666667%;
        max-width: 66.666667%;
      }
      .col-md-9 {
        flex: 0 0 75%;
        max-width: 75%;
      }
      .col-md-10 {
        flex: 0 0 83.333333%;
        max-width: 83.333333%;
      }
      .col-md-11 {
        flex: 0 0 91.666667%;
        max-width: 91.666667%;
      }
      .col-md-12 {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }

    @media (min-width: 992px) {
      .col-lg {
        flex-basis: 0;
        flex-grow: 1;
        max-width: 100%;
      }
      .col-lg-auto {
        flex: 0 0 auto;
        width: auto;
        max-width: none;
      }
      .col-lg-1 {
        flex: 0 0 8.333333%;
        max-width: 8.333333%;
      }
      .col-lg-2 {
        flex: 0 0 16.666667%;
        max-width: 16.666667%;
      }
      .col-lg-3 {
        flex: 0 0 25%;
        max-width: 25%;
      }
      .col-lg-4 {
        flex: 0 0 33.333333%;
        max-width: 33.333333%;
      }
      .col-lg-5 {
        flex: 0 0 41.666667%;
        max-width: 41.666667%;
      }
      .col-lg-6 {
        flex: 0 0 50%;
        max-width: 50%;
      }
      .col-lg-7 {
        flex: 0 0 58.333333%;
        max-width: 58.333333%;
      }
      .col-lg-8 {
        flex: 0 0 66.666667%;
        max-width: 66.666667%;
      }
      .col-lg-9 {
        flex: 0 0 75%;
        max-width: 75%;
      }
      .col-lg-10 {
        flex: 0 0 83.333333%;
        max-width: 83.333333%;
      }
      .col-lg-11 {
        flex: 0 0 91.666667%;
        max-width: 91.666667%;
      }
      .col-lg-12 {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }

    @media (min-width: 1200px) {
      .col-xl {
        flex-basis: 0;
        flex-grow: 1;
        max-width: 100%;
      }
      .col-xl-auto {
        flex: 0 0 auto;
        width: auto;
        max-width: none;
      }
      .col-xl-1 {
        flex: 0 0 8.333333%;
        max-width: 8.333333%;
      }
      .col-xl-2 {
        flex: 0 0 16.666667%;
        max-width: 16.666667%;
      }
      .col-xl-3 {
        flex: 0 0 25%;
        max-width: 25%;
      }
      .col-xl-4 {
        flex: 0 0 33.333333%;
        max-width: 33.333333%;
      }
      .col-xl-5 {
        flex: 0 0 41.666667%;
        max-width: 41.666667%;
      }
      .col-xl-6 {
        flex: 0 0 50%;
        max-width: 50%;
      }
      .col-xl-7 {
        flex: 0 0 58.333333%;
        max-width: 58.333333%;
      }
      .col-xl-8 {
        flex: 0 0 66.666667%;
        max-width: 66.666667%;
      }
      .col-xl-9 {
        flex: 0 0 75%;
        max-width: 75%;
      }
      .col-xl-10 {
        flex: 0 0 83.333333%;
        max-width: 83.333333%;
      }
      .col-xl-11 {
        flex: 0 0 91.666667%;
        max-width: 91.666667%;
      }
      .col-xl-12 {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
  `}
`
