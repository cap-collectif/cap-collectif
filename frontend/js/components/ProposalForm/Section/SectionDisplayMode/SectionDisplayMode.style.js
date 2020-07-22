// @flow
import styled, { type StyledComponent } from 'styled-components';
import { Panel } from 'react-bootstrap';
import colors from '~/utils/colors';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';

export const PanelHeader: StyledComponent<{}, {}, typeof Panel.Heading> = styled(Panel.Heading)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  a {
    color: ${colors.blue};
  }
`;

export const MapViewContent: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
  background-color: #fff;

  h5 {
    font-weight: 600;
    margin: 5px 0 20px 0;
    font-size: 16px;
  }
`;

export const MapContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;

  .map {
    width: 70%;
    height: 350px;
    ${MAIN_BORDER_RADIUS};
    margin-right: 10px;
  }

  .fields {
    flex: 1;
  }
`;

export const ButtonToggleView: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  background: none;
  border: none;
  padding: 0;
`;

export const Error: StyledComponent<{}, {}, HTMLSpanElement> = styled.span`
  color: ${colors.error};
`;
