// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectStatsFilters } from './ProjectStatsFilters';
import { intlMock } from '../../../mocks';

describe('<ProjectStatsFilters />', () => {
  const props = {
    intl: intlMock,
    themes: [{ id: 1, title: 'theme-1' }],
    districts: [{ id: 1, title: 'district-1' }],
    categories: [{ id: 1, title: 'category-1' }],
    showFilters: true,
    onThemeChange: () => {},
    onDistrictChange: () => {},
    onCategoryChange: () => {},
    showThemes: true,
    showDistricts: true,
  };

  const propsWithoutDistrictsAndThemes = {
    intl: intlMock,
    themes: [],
    districts: [],
    categories: [{ id: 1, title: 'category-1' }],
    showFilters: true,
    onThemeChange: () => {},
    onDistrictChange: () => {},
    onCategoryChange: () => {},
    showThemes: false,
    showDistricts: false,
  };

  it('should render 3 filters', () => {
    const wrapper = shallow(<ProjectStatsFilters {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render only categories filter', () => {
    const wrapper = shallow(<ProjectStatsFilters {...propsWithoutDistrictsAndThemes} />);
    expect(wrapper).toMatchSnapshot();
  });
});
