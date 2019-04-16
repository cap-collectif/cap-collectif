// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventListFilters } from './EventListFilters';
import { intlMock, formMock, $refType, $fragmentRefs } from '../../../mocks';
import { features } from '../../../redux/modules/default';

const defaultProps = {
  query: {
    $refType,
    $fragmentRefs,
  },
  userTypes: [{ id: 'userType-1', name: 'Citoyen' }, { id: 'userType-2', name: 'Institution' }],
  addToggleViewButton: true,
  ...formMock,
  intl: intlMock,
  search: 'PHP',
  theme: 'theme-1',
  userType: null,
  project: 'UHJvamVjdDpwcm9qZWN0MQ==',
  features: {
    ...features,
    themes: true,
    projects_form: true,
    display_map: true,
  },
};

describe('<EventListFilters />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<EventListFilters {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly without filters', () => {
    const props = {
      ...defaultProps,
      addToggleViewButton: false,
      features: { ...features, themes: false, projects_form: false, display_map: false },
    };
    const wrapper = shallow(<EventListFilters {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
