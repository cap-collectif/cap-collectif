// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ProfileNeutralIcon from './ProfileNeutralIcon';

describe('<ProfileNeutralIcon />', () => {
  it('renders correctly', () => {
    const props = {
      className: 'profile-neutral-icon',
      size: 16,
      color: 'black',
    };
    const wrapper = shallow(<ProfileNeutralIcon {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
