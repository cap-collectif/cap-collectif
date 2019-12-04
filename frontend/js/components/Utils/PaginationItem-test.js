// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import PaginationItem from './PaginationItem';

const props = {
  page: 3,
  onSelect: () => {},
};

describe('<PaginationItem />', () => {
  it('should render a pagination item', () => {
    const wrapper = shallow(<PaginationItem {...props} />);
    const item = wrapper.find('li');
    expect(item.prop('className')).not.toContain('active');
    expect(item.prop('className')).not.toContain('disabled');
    const itemWrapper = wrapper.find('.page-item__wrapper');
    expect(itemWrapper.prop('onClick')).toEqual(props.onSelect);
    expect(itemWrapper.prop('aria-label')).toEqual(props.page);
    const itemLabel = wrapper.find('.page-item__label');
    expect(itemLabel.text()).toEqual(`${props.page}`);
  });

  it('should render a disabled pagination item when specified', () => {
    const wrapper = shallow(<PaginationItem {...props} disabled />);
    const item = wrapper.find('li');
    expect(item.prop('className')).toContain('disabled');
  });

  it('should render an active pagination item when specified', () => {
    const wrapper = shallow(<PaginationItem {...props} active />);
    const item = wrapper.find('li');
    expect(item.prop('className')).toContain('active');
  });

  it('should render a pagination with specified label', () => {
    const wrapper = shallow(<PaginationItem {...props} label="test" />);
    const itemWrapper = wrapper.find('.page-item__wrapper');
    expect(itemWrapper.prop('aria-label')).toEqual('test');
    const itemLabel = wrapper.find('.page-item__label');
    expect(itemLabel.text()).toEqual('test');
  });

  it('should render a pagination with specified aria label even when label is specified', () => {
    const wrapper = shallow(<PaginationItem {...props} ariaLabel="test" label="test2" />);
    const itemWrapper = wrapper.find('.page-item__wrapper');
    expect(itemWrapper.prop('aria-label')).toEqual('test');
    const itemLabel = wrapper.find('.page-item__label');
    expect(itemLabel.text()).toEqual('test2');
  });
});
