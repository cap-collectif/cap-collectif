// @flow
// import * as React from 'react';
import styled from 'styled-components';

export const Progress = styled.div`
  .progress {
    margin: 15px 0;
    background-color: #F6F6F6;
  }
  
  .progress-bar_grey .progress-bar {
    background-color: #707070;
  }
  
  .progress-bar_empty .progress-bar {
     background-color: #F6F6F6;
     color: #707070;
     box-shadow: inset 0 1px 2px rgba(33, 37, 41, 0.1);
  }  
`;
