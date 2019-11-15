// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import { $refType, $fragmentRefs } from '../../../mocks';
import { ProjectPreviewExternalCounters } from './ProjectPreviewExternalCounters';

const props = {
  project: {
    $fragmentRefs,
    $refType,
    id: 'externalProject',
    externalLink: 'https://github.com/cap-collectif/platform/issues/8639',
    externalContributionsCount: 234,
    externalVotesCount: 534,
    externalParticipantsCount: 54,
  },
};

const propsWithoutCounter = {
  project: {
    $fragmentRefs,
    $refType,
    id: 'externalProject',
    externalLink: 'https://github.com/cap-collectif/platform/issues/8639',
    externalContributionsCount: 234,
    externalVotesCount: null,
    externalParticipantsCount: 0,
  },
};

describe('<ProjectPreviewProgressBar />', () => {
  it('should render correctly an external project with counter', () => {
    const wrapper = shallow(<ProjectPreviewExternalCounters {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly an external project without counter of votes but with participants', () => {
    const wrapper = shallow(<ProjectPreviewExternalCounters {...propsWithoutCounter} />);
    expect(wrapper).toMatchSnapshot();
  });
});
