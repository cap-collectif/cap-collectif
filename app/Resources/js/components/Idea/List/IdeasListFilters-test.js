/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';

import { shallow } from 'enzyme';
import IntlData from '../../../translations/FR';
import { IdeasListFilters } from './IdeasListFilters';
import IdeaCreate from '../Create/IdeaCreate';
import IdeasListSearch from './IdeasListSearch';

const props = {
  onChange: () => {},
  themes: [],
};

const featuresThemesEnabled = {
  themes: true,
  idea_creation: false,
};

const featuresIdeaCreationEnabled = {
  themes: false,
  idea_creation: true,
};

const featuresDisabled = {
  themes: false,
  idea_creation: false,
};

describe('<IdeasListFilters />', () => {
  it('it should render a row containing sorting input and ideas search but no themes nor create button', () => {
    const wrapper = shallow(<IdeasListFilters features={featuresDisabled} {...props} {...IntlData} />);
    expect(wrapper.find('Row')).toHaveLength(1);
    expect(wrapper.find(IdeaCreate)).toHaveLength(0);
    expect(wrapper.find('#idea-filter-theme')).toHaveLength(0);
    expect(wrapper.find(IdeasListSearch)).toHaveLength(1);
  });

  it('it should render the themes filter when feature is enabled', () => {
    const wrapper = shallow(<IdeasListFilters {...props} features={featuresThemesEnabled} {...IntlData} />);
    expect(wrapper.find('#idea-filter-theme')).toHaveLength(1);
  });

  it('it should render the idea create when feature is enabled', () => {
    const wrapper = shallow(<IdeasListFilters {...props} features={featuresIdeaCreationEnabled} {...IntlData} />);
    expect(wrapper.find(IdeaCreate)).toHaveLength(1);
  });
});
