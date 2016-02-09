/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import PinnedLabel from './PinnedLabel';

describe('<PinnedLabel />', () => {
  it('should render a blue label if shown', () => {
    const wrapper = shallow(<PinnedLabel show />);
    expect(wrapper.find('span.opinion__label.opinion__label--blue')).to.have.length(1);
  });

  it('should not render a blue label if not shown', () => {
    const wrapper = shallow(<PinnedLabel show={false} />);
    expect(wrapper.find('span.opinion__label.opinion__label--blue')).to.not.exists;
  });
});
