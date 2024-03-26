// @ts-nocheck

import styled from 'styled-components'
import { mediaQueryMobile } from '~/utils/sizes'
import hexToRgb from '~/utils/colors/hexToRgb'
import rgbToHsl from '~/utils/colors/rgbToHsl'
import { formatRgb, formatHsl } from '~/utils/colors/formatColor'

export type Colors = {
  text: string
  background: string
}

const getColorHover = (color: string) => {
  const colorRgb = hexToRgb(color)
  const colorRgbFormatted = formatRgb(colorRgb)
  const { h, s, l } = rgbToHsl(colorRgbFormatted)
  return formatHsl({
    h,
    s,
    l: l - 10,
  })
}

export const Container = styled.div.attrs({
  className: 'home-header',
})`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  text-align: left;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    position: relative;
    z-index: 1;
    justify-content: center;
  }
`
export const Content = styled.div.attrs<{
  mainLinkColors: Colors
  secondLinkColor: string
}>({
  className: 'home-content-wrapper',
})`
  display: flex;
  flex-direction: column;
  width: 40%;

  h1 {
    color: #000 !important;
    font-size: 48px !important;
    line-height: 56px;
    font-weight: bold;
    margin: 14px 0 0 0;
  }

  .description {
    color: #36353b;
    font-size: 18px;
    line-height: 24px;
    margin: 16px 0 24px 0;
  }

  .wrapper-link {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-weight: 600;
    font-size: 18px;
  }

  .main-link {
    background-color: ${props => props.mainLinkColors.background};
    color: ${props => props.mainLinkColors.text};
    padding: 16px 24px;
    margin-right: 22px;
    border-radius: 8px;

    &:hover {
      text-decoration: none;
      background-color: ${props => getColorHover(props.mainLinkColors.background)};
    }
  }

  .second-link {
    font-size: 20px;
    color: ${props => props.secondLinkColor};

    &:hover {
      text-decoration: underline;
      color: ${props => props.secondLinkColor};
    }

    span {
      vertical-align: middle;
    }

    .icon {
      margin-left: 10px;
    }
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    width: 100%;
    align-items: center;

    h1 {
      font-size: 40px !important;
      line-height: 48px !important;
    }

    .description {
      text-align: center;
    }

    .wrapper-link {
      flex-direction: column;
    }

    .main-link {
      margin-right: 0;
      margin-bottom: 15px;
      padding: 14px 18px;
    }
  }
`
export const Illustration: StyledComponent<
  {
    img: string
  },
  {},
  HTMLDivElement
> = styled.div.attrs({
  className: 'illustration-wrapper',
})`
  display: flex;
  height: 100%;
  width: 50%;
  border-radius: 5px;
  overflow: hidden;

  .illustration {
    height: auto;
    width: 100%;
  }

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: 0.1;
    border-radius: inherit;
    background-image: ${props => `url(${props.img})`};
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }
`
export const Tag: StyledComponent<
  {
    colors: Colors
  },
  {},
  HTMLDivElement
> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  color: ${props => props.colors.text};
  background-color: ${props => props.colors.background};
  padding: 4px 10px;
  border-radius: 16px;
  align-self: flex-start;

  @media (max-width: ${mediaQueryMobile.maxWidth}) {
    align-self: initial;
  }
`
