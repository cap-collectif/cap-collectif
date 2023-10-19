import styled, { css } from 'styled-components'

const Body = styled.div.attrs({
  className: 'card__body',
})<{
  isHorizontal?: boolean
  position?: 'relative' | 'absolute'
}>`
  display: flex;
  padding: 15px;
  flex: 1 0 auto;
  position: ${props => (props.position ? props.position : '')};
  flex-direction: ${props => (props.isHorizontal ? 'row' : 'column')};
  word-wrap: break-word;
  ${({ isHorizontal }) =>
    isHorizontal &&
    css`
      align-items: center;
      justify-content: space-between;
    `}

  hr {
    margin: 15px 0 10px;
  }

  @media print {
    display: block;
    padding: 0;
  }
`
export default Body
