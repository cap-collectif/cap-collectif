// @flow
import styled, { type StyledComponent } from 'styled-components';
import Slider from 'react-slick';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled(Slider)`
  width: 100%;

  .slick-track {
    display: flex;
    align-items: center;
  }

  .slick-slide {
    padding: 0 20px;

    img {
      width: 100%;
    }
  }
`;
