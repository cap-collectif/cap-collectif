// @flow

import { css } from 'styled-components';
import colors from '~/utils/colors';

export const MAIN_BORDER_RADIUS_SIZE = '4px';

export const MAIN_BORDER_RADIUS = css`
  border-radius: ${MAIN_BORDER_RADIUS_SIZE};
`;

export const LIGHT_BOX_SHADOW = css`
  box-shadow: 0 0 10px 0 rgba(222, 224, 228, 0.8);
`;

export const BASE_INPUT = css`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid ${colors.lightGray};
  background-color: #fafafa;
  width: 300px;

  &:disabled {
    background-color: ${colors.disabledGray};
  }
`;

export const MAX_MAP_ZOOM = 22;
