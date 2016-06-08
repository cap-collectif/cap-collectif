/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeasIndexPage from './IdeasIndexPage';
import IdeasIndexHeader from './IdeasIndexHeader';
import IdeasListFilters from '../List/IdeasListFilters';
import IdeasPaginatedList from '../List/IdeasPaginatedList';
import IdeasIndexFooter from './IdeasIndexFooter';
import Loader from '../../Utils/Loader';

const props = {
  count: 5,
  countTrashed: 0,
  ideas: [],
  themes: [],
};

describe('<IdeasIndexPage />', () => {
  it('it should render ideas index page', () => {
    const wrapper = shallow(<IdeasIndexPage {...props} {...IntlData} />);
    expect(wrapper.find(IdeasIndexHeader)).to.have.length(1);
    expect(wrapper.find(IdeasListFilters)).to.have.length(1);
    const loader = wrapper.find(Loader);
    expect(loader).to.have.length(1);
    expect(loader.find(IdeasPaginatedList)).to.have.length(1);
    expect(wrapper.find(IdeasIndexFooter)).to.have.length(1);
  });
});
