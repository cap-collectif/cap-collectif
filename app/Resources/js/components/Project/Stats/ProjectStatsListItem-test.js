/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ProjectStatsListItem from './ProjectStatsListItem';

describe('<ProjectStatsListItem />', () => {
  const item = {
    name: 'test',
    value: 2,
    percentage: 35.3,
  };

  const props = {
    item: item,
    showPercentage: true,
    isCurrency: false,
  };

  it('should render a bar and a value', () => {
    const wrapper = shallow(<ProjectStatsListItem {...props} />);
    expect(wrapper.find('span.stats__list__bar')).to.have.length(1);
    expect(wrapper.find('div.stats__list__value')).to.have.length(1);
  });
});
