// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import AlertFormSucceededMessage from './AlertFormSucceededMessage';

describe('<AlertFormSucceededMessage />', () => {
  it('render correctly', () => {
    const wrapper = shallow(<AlertFormSucceededMessage />);
    expect(wrapper).toMatchSnapshot();
  });
});
