// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProjectStatsListItem from './ProjectStatsListItem';

describe('<ProjectStatsListItem />', () => {
  const item = {
    name: 'test',
    value: 2,
    percentage: 35.3,
  };

  const props = {
    item,
    showPercentage: true,
    isCurrency: false,
  };

  it('should render a bar and a value', () => {
    const wrapper = shallow(<ProjectStatsListItem {...props} />);
    expect(wrapper.find('span.stats__list__bar')).toHaveLength(1);
    expect(wrapper.find('div.stats__list__value')).toHaveLength(1);
  });
});
