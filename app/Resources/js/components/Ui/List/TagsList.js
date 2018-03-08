// @flow
// mport * as React from 'react';
import styled from 'styled-components';

const TagsList = styled.div.attrs({
  className: "ellipsis"
})`
  margin-top: 5px;
  font-size: 14px;

  .tags-list__tag {
    padding: 5px 0 0 5px;
    display: block;
    
    &:first-child {
      padding: 0 0 0 5px;
    }
    
    .cap {
      padding-right: 5px;
    }
  } 
`;


export default TagsList;


