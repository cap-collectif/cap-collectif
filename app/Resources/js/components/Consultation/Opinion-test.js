// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { Opinion } from './Opinion';

describe('<Opinion />', () => {
  const props = {
    opinion: { id: 'opinionId' }
  };

  it('renders correcty', () => {
    const wrapper = shallow(<Opinion {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
