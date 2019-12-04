// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import CustomPageFields from './CustomPageFields';

describe('<CustomPageFields />', () => {
  it('renders correctly with no props', () => {
    const wrapper = shallow(<CustomPageFields disabled={false} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with picto', () => {
    const wrapper = shallow(<CustomPageFields picto disabled={false} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with disabled', () => {
    const wrapper = shallow(<CustomPageFields picto disabled />);
    expect(wrapper).toMatchSnapshot();
  });
});
