// @flow
import styled from 'styled-components';
import {
  border,
  color,
  flexbox,
  grid,
  layout,
  position,
  shadow,
  space,
  typography,
} from 'styled-system';
import shouldForwardProp from '@styled-system/should-forward-prop';

const AppBox = styled('div').withConfig({
  shouldForwardProp: prop => {
    return shouldForwardProp(prop);
  },
})(
  props => ({
    textTransform: props.uppercase ? 'uppercase' : undefined,
  }),
  shadow,
  color,
  space,
  layout,
  flexbox,
  grid,
  border,
  typography,
  position,
);

AppBox.displayName = 'AppBox';

export default AppBox;
