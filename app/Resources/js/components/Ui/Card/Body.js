// @flow
import styled from 'styled-components';

const Body = styled.div`
  display: flex;
  padding: 15px;
  flex: 1 0 auto;
  flex-direction: column;

  hr {
    margin: 15px 0;
  }

  @media print {
    display: block;
    padding: 0;
  }
`;

export default Body;
