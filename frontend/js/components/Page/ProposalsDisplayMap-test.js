// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ProposalsDisplayMap } from './ProposalsDisplayMap';
import { $fragmentRefs, $refType, relayPaginationMock } from '~/mocks';

const defaultMapOptions = {
  center: { lat: 48.8586047, lng: 2.3137325 },
  zoom: 12,
};

it('should render correctly with proposals', () => {
  const proposals = [
    {
      node: {
        id: 'proposal1',
        $fragmentRefs,
      },
    },
    {
      node: {
        id: 'proposal2',
        $fragmentRefs,
      },
    },
    {
      node: {
        id: 'proposal3',
        $fragmentRefs,
      },
    },
  ];
  const step = {
    ...$refType,
    proposals: {
      pageInfo: {
        hasNextPage: false,
        endCursor: '',
        hasPreviousPage: false,
        startCursor: '',
      },
      edges: proposals,
    },
  };
  const props = {
    relay: relayPaginationMock,
    step,
    defaultMapOptions,
  };
  const wrapper = shallow(<ProposalsDisplayMap {...props} />);
  expect(wrapper).toMatchSnapshot();
});

it('should not render when no proposals are in the step', () => {
  const step = { ...$refType };
  const props = { relay: relayPaginationMock, step, defaultMapOptions };
  const wrapper = shallow(<ProposalsDisplayMap {...props} />);
  expect(wrapper).toMatchSnapshot();
});
