// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { SelectProject } from './SelectProject';
import { $refType, intlMock } from '../../mocks';

describe('<SelectProject />', () => {
  const props = {
    query: {
      projects: {
        edges: [
          {
            node: {
              id: 'project1',
              title: 'Save the world',
            },
          },
          {
            node: {
              id: 'project2',
              title: 'Decrease the GES to 55% before 2030',
            },
          },
        ],
      },
      $refType,
    },
    intl: intlMock,
  };

  const emptyList = {
    query: {
      projects: { edges: [] },
      $refType,
    },
    intl: intlMock,
  };

  it('should render correctly', () => {
    const wrapper = shallow(<SelectProject {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render empty list', () => {
    const wrapper = shallow(<SelectProject {...emptyList} />);
    expect(wrapper).toMatchSnapshot();
  });
});
