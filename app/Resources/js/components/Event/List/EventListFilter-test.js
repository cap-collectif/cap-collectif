// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventListFilters } from './EventListFilters';
import { intlMock, formMock } from '../../../mocks';
import { features } from '../../../redux/modules/default';

describe('<EventListFilters />', () => {
  it('renders correctly', () => {
    const props = {
      themes: [
        { id: 'theme-1', title: "Le gouter c'est la vie" },
        { id: 'theme-2', title: 'Theme 2' },
      ],
      userTypes: [{ id: 'userType-1', name: 'Citoyen' }, { id: 'userType-2', name: 'Institution' }],
      addToggleViewButton: true,
      ...formMock,
      intl: intlMock,
      projects: {},
      search: 'PHP',
      theme: 'theme-1',
      project: 'project1',
      features: {
        ...features,
        themes: true,
        projects_form: true,
        display_map: true,
      },
    };
    const wrapper = shallow(<EventListFilters {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without filters', () => {
    const props = {
      themes: [
        { id: 'theme-1', title: "Le gouter c'est la vie" },
        { id: 'theme-2', title: 'Theme 2' },
      ],
      userTypes: [{ id: 'userType-1', name: 'Citoyen' }, { id: 'userType-2', name: 'Institution' }],
      addToggleViewButton: false,
      ...formMock,
      intl: intlMock,
      projects: {},
      search: 'PHP',
      theme: 'theme-1',
      project: 'project1',
      features: {
        ...features,
        themes: false,
        projects_form: false,
        display_map: false,
      },
    };
    const wrapper = shallow(<EventListFilters {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
