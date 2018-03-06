/* eslint-env jest */

import React from 'react';

import { shallow } from 'enzyme';

import IdeasListSearch from './IdeasListSearch';
import Input from '../../Form/Input';

const props = {
  onChange: () => {}
};

describe('<IdeasListSearch />', () => {
  it('it should render a search input', () => {
    const wrapper = shallow(<IdeasListSearch {...props} />);
    const form = wrapper.find('form');
    expect(form).toHaveLength(1);
    expect(form.prop('onSubmit')).toBeDefined();
    expect(form.prop('className')).toEqual('filter__search');
    const input = wrapper.find(Input);
    expect(input).toHaveLength(1);
    expect(input.prop('id')).toEqual('idea-search-input');
    expect(input.prop('type')).toEqual('text');
    expect(input.prop('groupClassName')).toEqual('idea-search-group pull-right');
  });
});
