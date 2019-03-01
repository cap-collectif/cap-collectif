// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventStatusFilter } from './EventStatusFilter';
import { $refType } from '../../../mocks';

const defaultQuery = {
  $refType,
  events: {
    totalCount: 2,
    edges: [
      {
        node: {
          id: '1',
        },
      },
      {
        node: {
          id: '2',
        },
      },
    ],
  },
  eventsWithoutFilters: {
    totalCount: 2,
  },
};
const defaultProps = {
  query: {
    ...defaultQuery,
  },
  status: 'finished',
};

describe('<EventListFilters />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<EventStatusFilter {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when filtered projects', () => {
    const props = {
      query: {
        ...defaultQuery,
        eventsWithoutFilters: {
          totalCount: 10,
        },
      },
      status: 'ongoing-and-future',
    };
    const wrapper = shallow(<EventStatusFilter {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
