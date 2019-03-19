// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { EventListCounter } from './EventListCounter';
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
};

describe('<EventListCounters />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<EventListCounter {...defaultProps} />);
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
    };
    const wrapper = shallow(<EventListCounter {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
