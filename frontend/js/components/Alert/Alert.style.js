// @flow
import styled, { type StyledComponent } from 'styled-components';
import { AlertColors } from '~/utils/colors';
import { TYPE_ALERT } from '~/constants/AlertConstants';

const AlertContainer: StyledComponent<
  { type: $Values<typeof TYPE_ALERT> },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'alert',
})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: ${props => AlertColors[props.type].background};
  color: ${props => AlertColors[props.type].color};
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-weight: normal;

  button {
    background: none;
    border: none;

    svg,
    path {
      fill: ${props => AlertColors[props.type].color};
    }
  }
`;

export default AlertContainer;
