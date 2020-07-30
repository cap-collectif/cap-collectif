// @flow
import styled, { css, type StyledComponent } from 'styled-components';

export const Container: StyledComponent<
  { image?: string, width?: string, height?: string },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'thumbnail-container',
})`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => (props.image ? 'transparent' : '#000')};
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '100%'};
  padding: 50px;
  ${props =>
    props.image &&
    css`
      background-image: url(${props.image});
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
    `}
`;
