// @flow
// import * as React from 'react';
import styled from 'styled-components';


export const CardContainer = styled.div`
  border: 1px solid #e3e3e3;
  background-color: #fff;
  margin-bottom: 30px;
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  width: 100%;
  border-radius: 4px;
  
  h3, h2 {
    font-size: 18px;
    line-height: 1.2;
    margin-top: 5px;
  }
  
  .card__body {
    display: flex;
    padding: 15px;
    flex: 1 0 auto;
    flex-direction: column;
    
    &__infos {
      flex: 1 0 auto;
      margin-bottom: 15px;
    }
    
    &__actions {
      color: #707070;
      font-size: 14px;
    
      a {
        text-transform: uppercase;
        margin-right: 10px;
      }
     
      .remaining-time__number {
        color: #212529;
      }
    }
  }
`;
