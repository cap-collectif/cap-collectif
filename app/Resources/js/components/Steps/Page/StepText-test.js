/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import StepText from './StepText';

describe('<StepText />', () => {
  it('should render a step intro div, a FormattedHTMLMessage and a ReadMoreLink', () => {
    const wrapper = shallow(<StepText text="coucou" />);
    expect(wrapper.find('div.step__intro')).to.have.length(1);
    expect(wrapper.find('FormattedHTMLMessage')).to.have.length(1);
    expect(wrapper.find('ReadMoreLink')).to.have.length(1);
  });

  it('should not render anything when there is no text provided', () => {
    const wrapper = shallow(<StepText />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('should not render anything when text is empty', () => {
    const wrapper = shallow(<StepText text="" />);
    expect(wrapper.children()).to.have.length(0);
  });
});
