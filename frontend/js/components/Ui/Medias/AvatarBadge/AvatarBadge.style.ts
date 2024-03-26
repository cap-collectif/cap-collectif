import styled from 'styled-components'

export const Circle = styled.div.attrs({
  className: 'circle',
})<{
  color: string
  size: number
}>`
  background-color: ${props => props.color};
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
  border-radius: ${props => `${props.size / 2}px`};
`
const AvatarBadgeContainer = styled.div`
  display: inline-block;
  position: relative;

  .circle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: -5px;
    right: -9px;
  }
`
export default AvatarBadgeContainer
