// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ButtonPopover, { PLACEMENT } from './ButtonPopover';

const props = {
  id: '1',
  placement: PLACEMENT.TOP,
  trigger: <button type="button">Hello world</button>,
};

describe('<ButtonPopover />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <ButtonPopover {...props}>
        <p>Bonjour</p>
      </ButtonPopover>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
