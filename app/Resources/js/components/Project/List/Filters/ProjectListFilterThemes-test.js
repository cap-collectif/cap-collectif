// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProjectsListFilterThemes from './ProjectListFilterThemes';
import { intlMock } from '../../../../mocks';

const defaultPropsThemes = {
  themes: [
    {
      id: '1',
      slug: 'Sarah1',
      title: 'SarahKonor',
    },
    {
      id: '2',
      slug: 'Sarah2',
      title: 'SarahCroche',
    },
    {
      id: '3',
      slug: 'Sarah3',
      title: 'SarahPelle',
    },
    {
      id: '4',
      slug: 'Sarah4',
      title: 'SarahZin',
    },
  ],
  theme: null,
  intl: intlMock,
};

describe('<ProjectsListFilterThemes />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectsListFilterThemes {...defaultPropsThemes} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with a selected theme', () => {
    const wrapper = shallow(<ProjectsListFilterThemes {...defaultPropsThemes} theme="1" />);
    expect(wrapper).toMatchSnapshot();
  });
});
