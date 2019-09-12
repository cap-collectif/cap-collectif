// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { BodyInfos } from './BodyInfos';

describe('<BodyInfos />', () => {
  it('should render correcty', () => {
    const wrapper = shallow(<BodyInfos body="coucou" />);
    expect(wrapper).toMatchSnapshot();
  });
});
