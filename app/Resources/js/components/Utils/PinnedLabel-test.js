/* eslint-env jest */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import PinnedLabel from './PinnedLabel';
import IntlData from '../../translations/FR';

describe('<PinnedLabel />', () => {
  it('should render a blue label if shown for opinion', () => {
    const wrapper = shallow(<PinnedLabel show {...IntlData} type="opinion" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a blue label if shown for comment', () => {
    const wrapper = shallow(<PinnedLabel show {...IntlData} type="comment" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a blue label if not shown', () => {
    const wrapper = shallow(
      <PinnedLabel show={false} {...IntlData} type="opinion" />,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
