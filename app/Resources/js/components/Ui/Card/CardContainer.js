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
    margin: 5px 0 10px;
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
  
  .card__tags {
    margin-top: 5px;
    font-size: 14px;
  
    .card__tag{
      padding: 5px 0 0 5px;
      display: block;
      
      .cap {
        padding-right: 5px;
      }
    } 
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
  }
  
  .card__counter__value {
      font-size: 18px;
    }
`;
