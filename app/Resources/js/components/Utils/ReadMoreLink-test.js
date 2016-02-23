/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import IntlData from '../../translations/FR';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ReadMoreLink from './ReadMoreLink';

describe('<ReadMoreLink />', () => {
  it('should not render anything if not visible', () => {
    const wrapper = shallow(<ReadMoreLink visible={false} expanded={false} {...IntlData} />);
    expect(wrapper.children()).to.have.length(0);
  });

  it('should render a button with correct label if not expanded', () => {
    const wrapper = shallow(<ReadMoreLink visible expanded={false} {...IntlData} />);
    expect(wrapper.find('Button')).to.have.length(1);
    expect(wrapper.find('Button').prop('children')).to.equal('Afficher la suite');
  });

  it('should render a button with correct label if expanded', () => {
    const wrapper = shallow(<ReadMoreLink visible expanded {...IntlData} />);
    expect(wrapper.find('Button')).to.have.length(1);
    expect(wrapper.find('Button').prop('children')).to.equal('Masquer');
  });
});
