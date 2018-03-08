// @flow
// mport * as React from 'react';
import styled from 'styled-components';

const DotList = styled.ul.attrs({
  className: "excerpt"
})`
  padding: 0;

  li {
    display: inline;
  
    &::after {
      content: "•";
      padding: 0 5px;
    }
    
    &:last-child::after {
      content: '';
      padding: 0;
    }
  }
`;


export default DotList;


