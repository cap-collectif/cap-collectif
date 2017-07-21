/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ReadMoreLink from './ReadMoreLink';
import IntlData from '../../translations/FR';

describe('<ReadMoreLink />', () => {
  const emptyFunction = () => {};
  it('should not render anything if not visible', () => {
    const wrapper = shallow(<ReadMoreLink visible={false} expanded={false} onClick={emptyFunction} {...IntlData} />);
    expect(wrapper.children()).toHaveLength(0);
  });

  it('should render a button with correct label if not expanded', () => {
    const wrapper = shallow(<ReadMoreLink visible expanded={false} onClick={emptyFunction} {...IntlData} />);
    expect(wrapper.find('Button')).toHaveLength(1);
    expect(wrapper.find('Button').prop('children')).toEqual('Afficher la suite');
  });

  it('should render a button with correct label if expanded', () => {
    const wrapper = shallow(<ReadMoreLink visible expanded onClick={emptyFunction} {...IntlData} />);
    expect(wrapper.find('Button')).toHaveLength(1);
    expect(wrapper.find('Button').prop('children')).toEqual('Masquer');
  });
});
