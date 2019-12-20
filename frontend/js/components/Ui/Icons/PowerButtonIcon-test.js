// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import PowerButtonIcon from './PowerButtonIcon';

describe('<PowerButtonIcon />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'power-button-icon',
      size: 16,
      color: 'black',
    };
    const wrapper = shallow(<PowerButtonIcon {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
