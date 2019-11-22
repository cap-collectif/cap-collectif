// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import EarthIcon from './EarthIcon';

describe('<EarthIcon />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'earth-icon',
      size: 16,
      color: 'black',
    };
    const wrapper = shallow(<EarthIcon {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
