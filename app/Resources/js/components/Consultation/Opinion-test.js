// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Opinion } from './Opinion';
import IntlData from '../../translations/FR';

describe('<Opinion />', () => {
  const props = {
    ...IntlData,
    opinion: { id: 'opinionId' },
  };

  it('renders correcty', () => {
    const wrapper = shallow(<Opinion {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
