import styled from 'styled-components'
import tinycolor from 'tinycolor2'
import { getButtonColorForType, getLabelColorForType } from '@shared/login/LoginSocialButton'
import type { LinkButtonProps } from '@shared/login/LoginSocialButton'
import Link from '~ds/Link/Link'
type ButtonType = {
  readonly children: JSX.Element | JSX.Element[] | string
  readonly href?: string
  readonly target?: string
  readonly textColor: string
}
type PrimarySSOButtonType = ButtonType & {
  readonly backgroundColor: string
}
type SecondarySSOButtonType = ButtonType & {
  readonly borderColor: string
}
export const BaseButton = styled(Link)<ButtonType>`
  width: 325px;
  padding: 12px 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  color: ${props => props.textColor};
  &:hover {
    text-decoration: none;
    color: ${props => props.textColor};
  }
  &:focus {
    text-decoration: none;
    color: ${props => props.textColor};
  }
`
export const PrimarySSOButton = styled(BaseButton)<PrimarySSOButtonType>`
  background-color: ${props => props.backgroundColor};
`
export const SecondarySSOButton = styled(BaseButton)<SecondarySSOButtonType>`
  border: 1px solid ${props => props.borderColor};
`
export const TertiarySSOButton = styled(BaseButton)`
  padding: 0;
`
export const FranceConnectButton = styled.div`
  width: 325px;
  border-radius: 4px;
  background: rgb(3, 78, 162);
  text-align: center;
  margin-bottom: 16px;

  .loginIcon {
    & > svg {
      height: 45px;
    }
  }
`
export const LinkButton = styled.div<LinkButtonProps>`
  position: relative;
  height: 45px;
  width: 325px;
  border-radius: 3px;
  display: flex;
  margin-bottom: 16px;

  && {
    color: ${props => getLabelColorForType(props.type, props.labelColor)};
    background-color: ${props => getButtonColorForType(props.type, props.buttonColor)};
  }

  .loginIcon {
    top: 0;
    fill: ${props => getLabelColorForType(props.type, props.labelColor)};
    background-color: ${props => tinycolor(getButtonColorForType(props.type, props.buttonColor)).darken(10).toString()};
    width: 15%;
    border-radius: 3px 0 0 3px;
    display: flex;
    align-items: center;
    justify-content: center;

    & > svg {
      height: 60%;
      width: 100%;
      ${props => {
        if (props.type === 'openId' || props.type === 'saml' || props.type === 'cas') {
          return 'transform: translate(3px, 2px) scale(1.3);'
        }
      }}
    }
  }

  a {
    width: 100%;
    text-decoration: none;
    color: ${props => getLabelColorForType(props.type, props.labelColor)};

    span {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: fit-content;
    }
  }

  &:focus,
  &:hover {
    background-color: ${props => tinycolor(getButtonColorForType(props.type, props.buttonColor)).darken(10)};
    .loginIcon {
      background-color: ${props => tinycolor(getButtonColorForType(props.type, props.buttonColor)).darken(20)};
    }
  }
`
