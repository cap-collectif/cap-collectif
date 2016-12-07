/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';

import { shallow } from 'enzyme';
import PinnedLabel from './PinnedLabel';
import IntlData from '../../translations/FR';

describe('<PinnedLabel />', () => {
  it('should render a blue label if shown', () => {
    const wrapper = shallow(<PinnedLabel show {...IntlData} />);
    expect(wrapper.find('span.opinion__label.opinion__label--blue')).toHaveLength(1);
  });

  it('should not render a blue label if not shown', () => {
    const wrapper = shallow(<PinnedLabel show={false} {...IntlData} />);
    expect(wrapper.find('span.opinion__label.opinion__label--blue')).toHaveLength(0.0);
  });
});
