// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import CustomPageFields from './CustomPageFields';

describe('<CustomPageFields />', () => {
  it('renders correctly with no props', () => {
    const wrapper = shallow(<CustomPageFields />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with picto', () => {
    const wrapper = shallow(<CustomPageFields picto />);
    expect(wrapper).toMatchSnapshot();
  });
});
