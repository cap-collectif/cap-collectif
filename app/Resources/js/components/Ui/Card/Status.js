// @flow
import styled from 'styled-components';

const Status = styled.div.attrs({
  className: 'ellipsis',
})`
  border-bottom-right-radius: 3px;
  border-bottom-left-radius: 3px;
  padding: 3px;
  min-height: 25px;
  color: white;
  font-size: 14px;
  text-align: center;
`;

export default Status;
