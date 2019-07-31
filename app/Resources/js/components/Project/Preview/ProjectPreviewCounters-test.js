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
    districts: [],
    contributors: { totalCount: 48, anonymousCount: 2 },
    votes: { totalCount: 48 },
    contributionsCount: 71,
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
    districts: [{ name: 'rive gauche' }, { name: 'rive droite' }],
    contributors: { totalCount: 54, anonymousCount: 0 },
    votes: { totalCount: 54 },
    contributionsCount: 89,
    isVotesCounterDisplayable: true,
    isContributionsCounterDisplayable: true,
    isParticipantsCounterDisplayable: true,
  },
};

describe('<ProjectPreviewProgressBar />', () => {
  it('should render correctly counters without districts', () => {
    const wrapper = shallow(<ProjectPreviewCounters {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly counters with districts', () => {
    const wrapper = shallow(<ProjectPreviewCounters {...propsWithDistricts} />);
    expect(wrapper).toMatchSnapshot();
  });
});
