// @flow
import styled from 'styled-components';

const CardType = styled.div`
  background-color: ${props => props.color};
  border-top-right-radius: 3px;
  border-top-left-radius: 3px;
  text-align: center;
  padding: 2px;
  font-size: 14px;
  color: white;
`;

export default CardType;
