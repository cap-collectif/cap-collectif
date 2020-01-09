// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { Body } from './Body';
import { news, withoutParaph } from '../../../stories/mocks/news';

describe('Body />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Body news={news} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly but without paraph in body', () => {
    const wrapper = shallow(<Body news={withoutParaph} />);
    expect(wrapper).toMatchSnapshot();
  });
});
