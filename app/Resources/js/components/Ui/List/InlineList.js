// @flow
// mport * as React from 'react';
import styled from 'styled-components';

const InlineList = styled.ul.attrs({
  className: 'excerpt',
})`
  padding: 0;
  margin: 0;

  li {
    display: inline-block;

    &::after {
      content: '•';
      padding: 0 5px;
    }

    &:last-child::after {
      content: '';
      padding: 0;
    }
  }
`;

export default InlineList;
