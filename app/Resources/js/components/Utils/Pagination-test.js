// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import Pagination from './Pagination';

const props = {
  nbPages: 10,
  onChange: () => {},
};

describe('<Pagination />', () => {
  it('should render pagination with first, prev, next and last items plus correct number of items inbetween', () => {
    const wrapper = shallow(<Pagination {...props} current={5} />);
    expect(wrapper.find('div.pagination--custom.text-center')).toHaveLength(1);
    expect(wrapper.find('ul.pagination')).toHaveLength(1);
    const items = wrapper.find('PaginationItem');
    expect(items).toHaveLength(7);
    const firstItem = items.find({ id: 'first-page-item' });
    expect(firstItem).toHaveLength(1);
    expect(firstItem.prop('page')).toEqual(1);
    expect(firstItem.prop('onSelect')).toBeDefined();
    expect(firstItem.prop('label')).toEqual('«');
    expect(firstItem.prop('ariaLabel')).toEqual('Page 1');
    expect(firstItem.prop('disabled')).toEqual(false);
    expect(firstItem.prop('active')).toEqual(false);
    const prevItem = items.find({ id: 'prev-page-item' });
    expect(prevItem).toHaveLength(1);
    expect(prevItem.prop('page')).toEqual(4);
    expect(prevItem.prop('onSelect')).toBeDefined();
    expect(prevItem.prop('label')).toEqual('‹');
    expect(prevItem.prop('ariaLabel')).toEqual('Page 4');
    expect(prevItem.prop('disabled')).toEqual(false);
    expect(prevItem.prop('active')).toEqual(false);
    const currentItem = items.find({ id: 'page-item-5' });
    expect(currentItem).toHaveLength(1);
    expect(currentItem.prop('page')).toEqual(5);
    expect(currentItem.prop('onSelect')).toBeDefined();
    expect(currentItem.prop('ariaLabel')).toEqual('Page 5');
    expect(currentItem.prop('disabled')).toEqual(false);
    expect(currentItem.prop('active')).toEqual(true);
    const nextItem = items.find({ id: 'next-page-item' });
    expect(nextItem).toHaveLength(1);
    expect(nextItem.prop('page')).toEqual(6);
    expect(nextItem.prop('onSelect')).toBeDefined();
    expect(nextItem.prop('label')).toEqual('›');
    expect(nextItem.prop('ariaLabel')).toEqual('Page 6');
    expect(nextItem.prop('disabled')).toEqual(false);
    expect(nextItem.prop('active')).toEqual(false);
    const lastItem = items.find({ id: 'last-page-item' });
    expect(lastItem).toHaveLength(1);
    expect(lastItem.prop('page')).toEqual(10);
    expect(lastItem.prop('onSelect')).toBeDefined();
    expect(lastItem.prop('label')).toEqual('»');
    expect(lastItem.prop('ariaLabel')).toEqual('Page 10');
    expect(lastItem.prop('disabled')).toEqual(false);
    expect(lastItem.prop('active')).toEqual(false);
  });

  it('should render specified number of items when there is enough pages', () => {
    const wrapper = shallow(<Pagination {...props} current={5} displayedPages={10} />);
    const items = wrapper.find('PaginationItem');
    expect(items).toHaveLength(14);
  });

  it('should not render more pages than max even if specified otherwise', () => {
    const wrapper = shallow(<Pagination {...props} current={5} displayedPages={100} />);
    const items = wrapper.find('PaginationItem');
    expect(items).toHaveLength(14);
  });

  it('should not render first page item if specified', () => {
    const wrapper = shallow(<Pagination {...props} current={5} showFirst={false} />);
    const items = wrapper.find('PaginationItem');
    expect(items).toHaveLength(6);
    expect(items.find({ id: 'first-page-item' })).toHaveLength(0);
  });

  it('should not render previous page item if specified', () => {
    const wrapper = shallow(<Pagination {...props} current={5} showPrev={false} />);
    const items = wrapper.find('PaginationItem');
    expect(items).toHaveLength(6);
    expect(items.find({ id: 'prev-page-item' })).toHaveLength(0);
  });

  it('should not render next page item if specified', () => {
    const wrapper = shallow(<Pagination {...props} current={5} showNext={false} />);
    const items = wrapper.find('PaginationItem');
    expect(items).toHaveLength(6);
    expect(items.find({ id: 'next-page-item' })).toHaveLength(0);
  });

  it('should not render last page item if specified', () => {
    const wrapper = shallow(<Pagination {...props} current={5} showLast={false} />);
    const items = wrapper.find('PaginationItem');
    expect(items).toHaveLength(6);
    expect(items.find({ id: 'last-page-item' })).toHaveLength(0);
  });

  it('should render disabled first and prev page items if current page is first', () => {
    const wrapper = shallow(<Pagination {...props} current={1} />);
    const items = wrapper.find('PaginationItem');
    expect(items).toHaveLength(7);
    const prevItem = items.find({ id: 'prev-page-item' });
    expect(prevItem.prop('disabled')).toEqual(true);
    const firstItem = items.find({ id: 'first-page-item' });
    expect(firstItem.prop('disabled')).toEqual(true);
  });

  it('should render disabled next and last page items if current page is last', () => {
    const wrapper = shallow(<Pagination {...props} current={10} />);
    const items = wrapper.find('PaginationItem');
    expect(items).toHaveLength(7);
    const nextItem = items.find({ id: 'next-page-item' });
    expect(nextItem.prop('disabled')).toEqual(true);
    const lastItem = items.find({ id: 'last-page-item' });
    expect(lastItem.prop('disabled')).toEqual(true);
  });
});
