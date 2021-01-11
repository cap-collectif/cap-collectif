// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import VoteView from './VoteView';

describe('<VoteView />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<VoteView positivePercentage={42} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly on mobile', () => {
    const wrapper = shallow(<VoteView positivePercentage={42} isMobile />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when 100% positive', () => {
    const wrapper = shallow(<VoteView positivePercentage={100} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when 100% positive on mobile', () => {
    const wrapper = shallow(<VoteView positivePercentage={100} isMobile />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when 0% positive', () => {
    const wrapper = shallow(<VoteView positivePercentage={0} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly when 0% positive on mobile', () => {
    const wrapper = shallow(<VoteView positivePercentage={0} isMobile />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render when our ouf range percentage', () => {
    const wrapper = shallow(<VoteView positivePercentage={-45674} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should not render when our ouf range percentage on mobile', () => {
    const wrapper = shallow(<VoteView positivePercentage={-45674} isMobile />);
    expect(wrapper).toMatchSnapshot();
  });
});
