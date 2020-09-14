// @flow
import styled, { type StyledComponent } from 'styled-components';
import { LIGHT_BOX_SHADOW, MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export const Container: StyledComponent<{}, {}, HTMLAnchorElement> = styled.a.attrs({
  className: 'debate-preview-item',
})`
  display: flex;
  flex-direction: column;
  padding: 18px;
  ${MAIN_BORDER_RADIUS};

  p {
    margin: 15px 0 0 0;
    color: #000;
    font-weight: bold;
  }

  img {
    width: 100%;
    ${MAIN_BORDER_RADIUS};
  }

  &:hover {
    background-color: #fff;
    ${LIGHT_BOX_SHADOW};
    transition: all 0.3s;
  }
`;
