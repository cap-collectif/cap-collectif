// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ProjectsListFilterTypes } from './ProjectListFilterTypes';
import { intlMock } from '../../../../mocks';

const defaultPropsTypes = {
  projectTypes: [
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
  type: null,
  intl: intlMock,
};

describe('<ProjectsListFilterTypes />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectsListFilterTypes {...defaultPropsTypes} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with a selected theme', () => {
    const wrapper = shallow(<ProjectsListFilterTypes {...defaultPropsTypes} type="1" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly without projectType', () => {
    const props = {
      ...defaultPropsTypes,
      projectTypes: [
        {
          id: '1',
          slug: 'Sarah1',
          title: 'SarahKonor',
        },
      ],
    };
    const wrapper = shallow(<ProjectsListFilterTypes {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
