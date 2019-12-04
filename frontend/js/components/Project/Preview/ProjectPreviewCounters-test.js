// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import { $refType, $fragmentRefs } from '../../../mocks';
import { ProjectPreviewCounters } from './ProjectPreviewCounters';

const props = {
  project: {
    $fragmentRefs,
    $refType,
    id: 'UHJvamVjdDpwcm9qZWN0MQ==',
    districts: {
      totalCount: 0,
      edges: [],
    },
    contributors: { totalCount: 48, anonymousCount: 2 },
    votes: { totalCount: 48 },
    contributionsCount: 71,
    isExternal: false,
    hasParticipativeStep: true,
    isVotesCounterDisplayable: true,
    isContributionsCounterDisplayable: true,
    isParticipantsCounterDisplayable: true,
  },
};

const propsWithDistricts = {
  project: {
    $fragmentRefs,
    $refType,
    id: 'project2',
    isExternal: false,
    hasParticipativeStep: true,
    districts: {
      totalCount: 5,
      edges: [
        { node: { name: 'zone 1' } },
        { node: { name: 'zone 2' } },
        { node: { name: 'zone 3' } },
        { node: { name: 'zone 4' } },
        { node: { name: 'zone 5' } },
      ],
    },
    contributors: { totalCount: 54, anonymousCount: 0 },
    votes: { totalCount: 54 },
    contributionsCount: 89,
    isVotesCounterDisplayable: true,
    isContributionsCounterDisplayable: true,
    isParticipantsCounterDisplayable: true,
  },
};

describe('<ProjectPreviewCounters />', () => {
  it('should render correctly counters without districts', () => {
    const wrapper = shallow(<ProjectPreviewCounters {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly counters with districts', () => {
    const wrapper = shallow(<ProjectPreviewCounters {...propsWithDistricts} />);
    expect(wrapper).toMatchSnapshot();
  });
});
