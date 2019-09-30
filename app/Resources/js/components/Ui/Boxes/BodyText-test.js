// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import BodyText from './BodyText';


describe('<BodyText />', () => {
  it('should render a step intro div and a FormattedHTMLMessage', () => {
    const wrapper = shallow(<BodyText text="coucou" />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('div.step__intro')).toHaveLength(1);
    expect(wrapper.find('ReadMoreLink')).toHaveLength(0);
  });

  it('should not render anything when there is no text provided', () => {
    const wrapper = shallow(<BodyText />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.children()).toHaveLength(0);
  });

  it('should not render anything when text is empty', () => {
    const wrapper = shallow(<BodyText text="" />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.children()).toHaveLength(0);
  });
});
