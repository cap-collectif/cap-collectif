import { $Values } from 'utility-types'
import type { Node } from 'react'
import 'react'
import { css } from 'styled-components'
import colors from '~/utils/colors'
import { mediaQueryMobile } from '~/utils/sizes'
import { TYPE_FORM } from '~/constants/FormConstants'

export type PropsCommonCheckboxRadio = {
  id: string
  name: string
  value: string
  checked?: boolean
  className?: string
  disabled?: boolean
  label?: Node | string
  image?: string
  onChange?: (...args: Array<any>) => any
  onBlur?: (...args: Array<any>) => any
  typeForm?: $Values<typeof TYPE_FORM>
}
export const sharedStyleCheckboxRadio = (hasImage: boolean = false, checked: boolean = false) => css`
  display: inline-flex;
  position: relative;
  ${hasImage &&
  ` 
    width: 100%;
    max-height: 450px;
    text-align: center;
    
    .icon {
      margin-top: 10px;
    }
  `}

  input {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  label {
    margin: 0;
    display: flex;
    align-items: center;
    ${hasImage &&
    `
        flex-direction: column;
        align-items: center;
        border: 1px solid ${colors.lightGray};
        border-radius: 4px;
        padding: 10px;
        background-color: ${checked ? colors.lightGray : 'transparent'};
        width: 100%;
        
        & > img {
            width: auto;
            height: auto;
            max-width: 100%;
            max-height: 88%;
            flex: auto;
        }
        
        &:hover {
          background-color: ${colors.lightGray};
        }
      `}

    & > * {
      vertical-align: middle;
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    ${hasImage &&
    ` 
        width: 100%;
        height: auto;
        max-height: initial;
        
        label {
          justify-content: center;
          
          img {
            width: 100%;
          }  
        }
      `}
  }
`
export const sharedStyleWrapperItemCheckboxRadio = (hasImage: boolean = false) => css`
  margin-bottom: 15px;

  .choice-description {
    margin: 0 0 0 32px;
  }

  ${hasImage &&
  `   
    width: 70%;
    height: auto;
    margin: 0 auto 15px auto;
    
    .choice-description {
      margin: 5px 0 0 0;
    }
  `};

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    ${hasImage &&
    ` 
        width: 100%;
      `}
  }
`
