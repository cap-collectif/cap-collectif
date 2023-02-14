// @flow
import styled, { css, type StyledComponent } from 'styled-components';
import { baseUrl } from '~/config';

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
      background-image: image-set(
        url(${baseUrl}'/cdn-cgi/image/width=320,format=auto/'${props.image}) 320w,
        url(${baseUrl}'/cdn-cgi/image/width=640,format=auto/'${props.image}) 640w,
        url(${baseUrl}'/cdn-cgi/image/width=960,format=auto/'${props.image}) 960w,
        url(${baseUrl}'/cdn-cgi/image/width=1280,format=auto/'${props.image}) 1280w,
        url(${baseUrl}'/cdn-cgi/image/width=2560,format=auto/'${props.image}) 2560w,
        url(${baseUrl}'/cdn-cgi/image/dpr=2,format=auto/'${props.image}) 2x,
        url(${baseUrl}'/cdn-cgi/image/dpr=3,format=auto/'${props.image}) 3x
      );
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
    `}
`;
