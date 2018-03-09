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
  
  .card__title {
    font-size: 18px;
    line-height: 1.2;
    margin: 0 0 10px;
  }
  
  .card__body {
    display: flex;
    padding: 15px;
    flex: 1 0 auto;
    flex-direction: column;
    
    &__infos {
      flex: 1 0 auto;
    }
  }
  
  button {
    margin-top: 15px;
  }
  
  .card__actions {
    color: #707070;
    font-size: 14px;
  
    a {
      text-transform: uppercase;
      margin-right: 10px;
    }
  }
  
  .card__counters {
    padding: 5px;
    background-color: #f6f6f6;
    border-top: 1px solid #e3e3e3;
    font-size: 14px;
    text-align: center;
    
    &_multiple .card__counter {
       width: 50%;
       
       &:nth-child(2) {
        border-left: 1px solid #e3e3e3;
       }
    }
    
    .card__counter {
      display: inline-block;
    
      &__value {
        font-size: 18px;
      }
    }
  }
`;
