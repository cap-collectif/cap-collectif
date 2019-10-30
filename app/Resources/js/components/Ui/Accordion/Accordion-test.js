// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import Accordion from './Accordion';

describe('<Accordion />', () => {
  const inputs = [
    {
      key: '0',
      title: 'Title',
      content: 'content with text and images and links etc',
    },
    {
      key: '1',
      title: 'Title 2',
      content: 'more content with more text and more images and more links etc',
    },
    {
      key: '2',
      title: 'Title 3',
      content: 'extra content with extra text and extra images and extra links etc',
    },
  ];
  const props = {
    inputs,
    defaultActiveKey: '1',
    openedColor: '#CB3F71',
    closedColor: '#E8A8BF',
    titleColor: '#FFF',
  };
  it('should render the correct number of panels with only the second one being active', () => {
    const wrapper = shallow(<Accordion {...props} />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('Accordion__PanelContainer')).toHaveLength(3);
    const middlePanel = wrapper.find('Accordion__PanelContainer').at(1);
    expect(middlePanel.prop('active')).toEqual(true);
    const firstPanel = wrapper.find('Accordion__PanelContainer').first();
    expect(firstPanel.prop('active')).toEqual(false);
    const lastPanel = wrapper.find('Accordion__PanelContainer').last();
    expect(lastPanel.prop('active')).toEqual(false);
  });
});
