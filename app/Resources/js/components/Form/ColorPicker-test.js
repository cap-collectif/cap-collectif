// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ColorPicker from './ColorPicker';

describe('<ColorPicker />', () => {
  it('renders correcty', () => {
    const props = {
      input: {
        value: '#DDAADD',
        onChange: () => {},
      },
    };

    const wrapper = shallow(<ColorPicker {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
