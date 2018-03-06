/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { IdeasListFilters } from './IdeasListFilters';

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
    const wrapper = shallow(<IdeasListFilters features={featuresDisabled} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it should render the themes filter when feature is enabled', () => {
    const wrapper = shallow(<IdeasListFilters {...props} features={featuresThemesEnabled} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it should render the idea create when feature is enabled', () => {
    const wrapper = shallow(<IdeasListFilters {...props} features={featuresIdeaCreationEnabled} />);
    expect(wrapper).toMatchSnapshot();
  });
});
