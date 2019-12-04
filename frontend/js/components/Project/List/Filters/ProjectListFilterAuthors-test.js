// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ProjectsListFilterAuthors from './ProjectListFilterAuthors';
import { intlMock } from '../../../../mocks';

const defaultPropsAuthor = {
  authors: [
    {
      id: 'Sarah1',
      username: 'SarahKonor',
    },
    {
      id: 'Sarah2',
      username: 'SarahCroche',
    },
    {
      id: 'Sarah3',
      username: 'SarahPelle',
    },
    {
      id: 'Sarah4',
      username: 'SarahZin',
    },
  ],
  author: null,
  intl: intlMock,
};

describe('<ProjectsListFilterAuthors />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectsListFilterAuthors {...defaultPropsAuthor} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with a selected author', () => {
    const wrapper = shallow(<ProjectsListFilterAuthors {...defaultPropsAuthor} author="PierreK" />);
    expect(wrapper).toMatchSnapshot();
  });
});
