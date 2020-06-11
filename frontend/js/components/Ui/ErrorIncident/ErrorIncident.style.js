// @flow
import styled, { type StyledComponent } from 'styled-components';

const ErrorIncidentContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;

  .icon-warning {
    margin-bottom: 10px;
  }

  p {
    margin: 5px 0;
  }

  p:first-of-type {
    font-weight: bold;
  }
`;

export default ErrorIncidentContainer;
