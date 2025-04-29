import { createGlobalStyle } from 'styled-components'

const GlobalCSS = createGlobalStyle`
  html, body, #__next, #__next > div:first-child {
      height: 100%
  }
    
  html {
    font-size: 14px;
  }
  
  .beamer_defaultBeamerSelector {
      display: none;
  }

  .uppy-StatusBar:not(.is-waiting) {
      width: 340px;
  }
`

export default GlobalCSS
