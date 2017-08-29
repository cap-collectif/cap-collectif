/* eslint-env jest */
// @flow
import * as React from 'react';
import { shallow } from 'enzyme';
import PinnedLabel from './PinnedLabel';

describe('<PinnedLabel />', () => {
  it('should render a blue label if shown for opinion', () => {
    const wrapper = shallow(<PinnedLabel show type="opinion" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a blue label if shown for comment', () => {
    const wrapper = shallow(<PinnedLabel show type="comment" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render a blue label if not shown', () => {
    const wrapper = shallow(<PinnedLabel show={false} type="opinion" />);
    expect(wrapper).toMatchSnapshot();
  });
});
