import styled, { css } from 'styled-components'
import colors from '~/utils/colors'

export const Card = styled.div.attrs({
  className: 'Card',
})<{
  withBorder?: boolean
  color?: string
}>`
  background: ${colors.white};
  border-radius: 4px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.175);
  ${({ withBorder, color }) =>
    withBorder &&
    css`
      border-top: 4px solid ${color || colors.yellow};
    `};
`
export const CategoryContainer = styled.div<{
  paddingTop?: number
}>`
  padding: 25px 30px;
  padding-top: ${({ paddingTop }) => (paddingTop || paddingTop === 0) && `${paddingTop}px`};

  .CategoryTitle {
    margin-bottom: 20px;
  }
`
export const CategoryCircledIcon = styled.div<{
  paddingLeft?: number
  paddingTop?: number
  size?: number
}>`
  width: ${({ size }) => (size ? `${size}px` : '36px')};
  height: ${({ size }) => (size ? `${size}px` : '36px')};
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.175);
  border-radius: 18px;
  padding-left: ${({ paddingLeft }) => (paddingLeft || paddingLeft === 0 ? `${paddingLeft}px` : '8px')};
  padding-top: ${({ paddingTop }) => (paddingTop || paddingTop === 0 ? `${paddingTop}px` : '7px')};
`
export const CategoryTitle = styled.div.attrs({
  className: 'CategoryTitle',
})`
  display: flex;
  align-items: center;
  width: 100%;

  h3 {
    text-transform: uppercase;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    margin-left: 15px;
  }

  h5 {
    color: ${colors.secondaryGray};
    margin-top: 15px;
    margin-left: 15px;
  }
`
export const Circle = styled.div`
  width: 18px;
  height: 18px;
  background: ${colors.secondaryGray};
  border-radius: 10px;
`
export const SeeMoreButton = styled.button`
  width: 100%;
  background: none;
  text-align: center;
  border: 1px solid ${colors.primaryColor};
  color: ${colors.primaryColor};
  padding: 5px;
  border-radius: 4px;
`
