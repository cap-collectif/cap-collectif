/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeasListSearch from './IdeasListSearch';
import Input from '../../Form/Input';

const props = {
  onChange: () => {},
};

describe('<IdeasListSearch />', () => {
  it('it should render a search input', () => {
    const wrapper = shallow(<IdeasListSearch {...props} {...IntlData} />);
    const form = wrapper.find('form');
    expect(form).to.have.length(1);
    expect(form.prop('onSubmit')).to.be.a('function');
    expect(form.prop('className')).to.equal('filter__search');
    const input = wrapper.find(Input);
    expect(input).to.have.length(1);
    expect(input.prop('id')).to.equal('idea-search-input');
    expect(input.prop('type')).to.equal('text');
    expect(input.prop('groupClassName')).to.equal('idea-search-group pull-right');
  });
});
