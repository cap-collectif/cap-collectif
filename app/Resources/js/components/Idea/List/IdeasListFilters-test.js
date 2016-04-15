/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import IdeasListFilters from './IdeasListFilters';
import IdeaCreate from '../Create/IdeaCreate';
import IdeasListSearch from './IdeasListSearch';

const props = {
  onChange: () => {},
  themes: [],
};

const featuresThemesEnabled = {
  themes: true,
};

const featuresIdeaCreationEnabled = {
  idea_creation: true,
};

describe('<IdeasListFilters />', () => {
  it('it should render a row containing sorting input and ideas search but no themes nor create button', () => {
    const wrapper = shallow(<IdeasListFilters {...props} {...IntlData} />);
    expect(wrapper.find('Row')).to.have.length(1);
    expect(wrapper.find(IdeaCreate)).to.have.length(0);
    expect(wrapper.find('#idea-filter-theme')).to.have.length(0);
    expect(wrapper.find(IdeasListSearch)).to.have.length(1);
  });

  it('it should render the themes filter when feature is enabled', () => {
    const wrapper = shallow(<IdeasListFilters {...props} features={featuresThemesEnabled} {...IntlData} />);
    expect(wrapper.find('#idea-filter-theme')).to.have.length(1);
  });

  it('it should render the idea create when feature is enabled', () => {
    const wrapper = shallow(<IdeasListFilters {...props} features={featuresIdeaCreationEnabled} {...IntlData} />);
    expect(wrapper.find(IdeaCreate)).to.have.length(1);
  });
});
