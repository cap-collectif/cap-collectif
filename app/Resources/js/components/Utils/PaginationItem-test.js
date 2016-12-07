/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';

import { shallow } from 'enzyme';
import IntlData from '../../translations/FR';
import PaginationItem from './PaginationItem';

const props = {
  page: 3,
  onSelect: () => {},
};

describe('<PaginationItem />', () => {
  it('should render a pagination item', () => {
    const wrapper = shallow(<PaginationItem {...props} {...IntlData} />);
    const item = wrapper.find('li');
    expect(item.prop('className')).to.not.contain('active');
    expect(item.prop('className')).to.not.contain('disabled');
    const itemWrapper = wrapper.find('.page-item__wrapper');
    expect(itemWrapper.prop('onClick')).toEqual(props.onSelect);
    expect(itemWrapper.prop('aria-label')).toEqual(props.page);
    const itemLabel = wrapper.find('.page-item__label');
    expect(itemLabel.text()).toEqual(`${props.page}`);
  });

  it('should render a disabled pagination item when specified', () => {
    const wrapper = shallow(<PaginationItem {...props} disabled {...IntlData} />);
    const item = wrapper.find('li');
    expect(item.prop('className')).to.contain('disabled');
  });

  it('should render an active pagination item when specified', () => {
    const wrapper = shallow(<PaginationItem {...props} active {...IntlData} />);
    const item = wrapper.find('li');
    expect(item.prop('className')).to.contain('active');
  });

  it('should render a pagination with specified label', () => {
    const wrapper = shallow(<PaginationItem {...props} label="test" {...IntlData} />);
    const itemWrapper = wrapper.find('.page-item__wrapper');
    expect(itemWrapper.prop('aria-label')).toEqual('test');
    const itemLabel = wrapper.find('.page-item__label');
    expect(itemLabel.text()).toEqual('test');
  });

  it('should render a pagination with specified aria label even when label is specified', () => {
    const wrapper = shallow(<PaginationItem {...props} ariaLabel="test" label="test2" {...IntlData} />);
    const itemWrapper = wrapper.find('.page-item__wrapper');
    expect(itemWrapper.prop('aria-label')).toEqual('test');
    const itemLabel = wrapper.find('.page-item__label');
    expect(itemLabel.text()).toEqual('test2');
  });
});
