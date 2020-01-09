// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { News } from './News';
import { news, withoutParaph } from '../../../stories/mocks/news';

describe('<News />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<News news={news} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly but without paraph in body', () => {
    const wrapper = shallow(<News news={withoutParaph} />);
    expect(wrapper).toMatchSnapshot();
  });
});
