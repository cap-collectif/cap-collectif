// @flow
// import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import colors from '../../../utils/colors';

export const Progress: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .progress {
    margin: 15px 0;
    background-color: ${colors.pageBgc};
  }

  .progress-bar_grey .progress-bar {
    background-color: ${colors.darkGray};
  }

  .progress-bar_empty .progress-bar {
    background-color: ${colors.pageBgc};
    color: ${colors.darkGray};
    box-shadow: inset 0 1px 2px rgba(33, 37, 41, 0.1);
  }
`;
