// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import StepText from './StepText';

describe('<StepText />', () => {
  it('should render a step intro div, a FormattedHTMLMessage and a ReadMoreLink', () => {
    const wrapper = shallow(<StepText text="coucou" />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('div.step__intro')).toHaveLength(1);
    expect(wrapper.find('ReadMoreLink')).toHaveLength(1);
  });

  it('should not render anything when there is no text provided', () => {
    const wrapper = shallow(<StepText />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.children()).toHaveLength(0);
  });

  it('should not render anything when text is empty', () => {
    const wrapper = shallow(<StepText text="" />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.children()).toHaveLength(0);
  });
});
