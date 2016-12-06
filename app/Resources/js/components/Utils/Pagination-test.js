/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../translations/FR';
import Pagination from './Pagination';

const props = {
  nbPages: 10,
  onChange: () => {},
};

describe('<Pagination />', () => {
  it('should render pagination with first, prev, next and last items plus correct number of items inbetween', () => {
    const wrapper = shallow(<Pagination {...props} current={5} {...IntlData} />);
    expect(wrapper.find('div.pagination--custom.text-center')).to.have.length(1);
    expect(wrapper.find('ul.pagination')).to.have.length(1);
    const items = wrapper.find('PaginationItem');
    expect(items).to.have.length(7);
    const firstItem = items.find({ id: 'first-page-item' });
    expect(firstItem).to.have.length(1);
    expect(firstItem.prop('page')).to.equal(1);
    expect(firstItem.prop('onSelect')).to.be.a('function');
    expect(firstItem.prop('label')).to.equal('«');
    expect(firstItem.prop('ariaLabel')).to.equal('Page 1');
    expect(firstItem.prop('disabled')).to.equal(false);
    expect(firstItem.prop('active')).to.equal(false);
    const prevItem = items.find({ id: 'prev-page-item' });
    expect(prevItem).to.have.length(1);
    expect(prevItem.prop('page')).to.equal(4);
    expect(prevItem.prop('onSelect')).to.be.a('function');
    expect(prevItem.prop('label')).to.equal('‹');
    expect(prevItem.prop('ariaLabel')).to.equal('Page 4');
    expect(prevItem.prop('disabled')).to.equal(false);
    expect(prevItem.prop('active')).to.equal(false);
    const currentItem = items.find({ id: 'page-item-5' });
    expect(currentItem).to.have.length(1);
    expect(currentItem.prop('page')).to.equal(5);
    expect(currentItem.prop('onSelect')).to.be.a('function');
    expect(currentItem.prop('ariaLabel')).to.equal('Page 5');
    expect(currentItem.prop('disabled')).to.equal(false);
    expect(currentItem.prop('active')).to.equal(true);
    const nextItem = items.find({ id: 'next-page-item' });
    expect(nextItem).to.have.length(1);
    expect(nextItem.prop('page')).to.equal(6);
    expect(nextItem.prop('onSelect')).to.be.a('function');
    expect(nextItem.prop('label')).to.equal('›');
    expect(nextItem.prop('ariaLabel')).to.equal('Page 6');
    expect(nextItem.prop('disabled')).to.equal(false);
    expect(nextItem.prop('active')).to.equal(false);
    const lastItem = items.find({ id: 'last-page-item' });
    expect(lastItem).to.have.length(1);
    expect(lastItem.prop('page')).to.equal(10);
    expect(lastItem.prop('onSelect')).to.be.a('function');
    expect(lastItem.prop('label')).to.equal('»');
    expect(lastItem.prop('ariaLabel')).to.equal('Page 10');
    expect(lastItem.prop('disabled')).to.equal(false);
    expect(lastItem.prop('active')).to.equal(false);
  });

  it('should render specified number of items when there is enough pages', () => {
    const wrapper = shallow(<Pagination {...props} current={5} displayedPages={10} {...IntlData} />);
    const items = wrapper.find('PaginationItem');
    expect(items).to.have.length(14);
  });

  it('should not render more pages than max even if specified otherwise', () => {
    const wrapper = shallow(<Pagination {...props} current={5} displayedPages={100} {...IntlData} />);
    const items = wrapper.find('PaginationItem');
    expect(items).to.have.length(14);
  });

  it('should not render first page item if specified', () => {
    const wrapper = shallow(<Pagination {...props} current={5} showFirst={false} {...IntlData} />);
    const items = wrapper.find('PaginationItem');
    expect(items).to.have.length(6);
    expect(items.find({ id: 'first-page-item' })).to.have.length(0);
  });

  it('should not render previous page item if specified', () => {
    const wrapper = shallow(<Pagination {...props} current={5} showPrev={false} {...IntlData} />);
    const items = wrapper.find('PaginationItem');
    expect(items).to.have.length(6);
    expect(items.find({ id: 'prev-page-item' })).to.have.length(0);
  });

  it('should not render next page item if specified', () => {
    const wrapper = shallow(<Pagination {...props} current={5} showNext={false} {...IntlData} />);
    const items = wrapper.find('PaginationItem');
    expect(items).to.have.length(6);
    expect(items.find({ id: 'next-page-item' })).to.have.length(0);
  });

  it('should not render last page item if specified', () => {
    const wrapper = shallow(<Pagination {...props} current={5} showLast={false} {...IntlData} />);
    const items = wrapper.find('PaginationItem');
    expect(items).to.have.length(6);
    expect(items.find({ id: 'last-page-item' })).to.have.length(0);
  });

  it('should render disabled first and prev page items if current page is first', () => {
    const wrapper = shallow(<Pagination {...props} current={1} {...IntlData} />);
    const items = wrapper.find('PaginationItem');
    expect(items).to.have.length(7);
    const prevItem = items.find({ id: 'prev-page-item' });
    expect(prevItem.prop('disabled')).to.equal(true);
    const firstItem = items.find({ id: 'first-page-item' });
    expect(firstItem.prop('disabled')).to.equal(true);
  });

  it('should render disabled next and last page items if current page is last', () => {
    const wrapper = shallow(<Pagination {...props} current={10} {...IntlData} />);
    const items = wrapper.find('PaginationItem');
    expect(items).to.have.length(7);
    const nextItem = items.find({ id: 'next-page-item' });
    expect(nextItem.prop('disabled')).to.equal(true);
    const lastItem = items.find({ id: 'last-page-item' });
    expect(lastItem.prop('disabled')).to.equal(true);
  });
});
