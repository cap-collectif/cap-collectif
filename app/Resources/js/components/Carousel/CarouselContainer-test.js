// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CarouselContainer } from './CarouselContainer';

describe('<CarouselDesktop />', () => {
  const props = {
    highlighteds: [{ id: 4 }, { id: 3 }, { id: 2 }, { id: 1 }],
  };

  it('should render correctly mobile carousel', () => {
    const wrapper = shallow(<CarouselContainer {...props} />);
    wrapper.setState({ windowWidth: 300 });
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly desktop carousel', () => {
    const wrapper = shallow(<CarouselContainer {...props} />);
    wrapper.setState({ windowWidth: 993 });
    expect(wrapper).toMatchSnapshot();
  });
});
