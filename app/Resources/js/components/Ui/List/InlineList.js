// @flow
import type { ComponentType } from 'react';
import styled from 'styled-components';
import colors from '../../../utils/colors';

type Props = {
  separator?: string,
};

const InlineList: ComponentType<Props> = styled.ul`
  padding: 0;
  margin: 0;

  li {
    display: inline;

    a {
      color: ${colors.darkGray};
    }

    &::after {
      content: ${props => (props.separator ? `"${props.separator}"` : `"•"`)};
      padding: ${props => (props.separator === ',' ? '0 5px 0 0' : '0 5px')};
    }

    &:last-child::after {
      content: '';
      padding: 0;
    }
  }
`;

export default InlineList;
