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
    contributors: { totalCount: 48 },
    votes: { totalCount: 48 },
    contributionsCount: 71,
  },
};

const propsWithoutCounter = {
  project: {
    $fragmentRefs,
    $refType,
    id: 'externalProject',
    externalLink: 'https://github.com/cap-collectif/platform/issues/8639',
    contributors: { totalCount: 0 },
    votes: { totalCount: 0 },
    contributionsCount: 0,
  },
};

describe('<ProjectPreviewProgressBar />', () => {
  it('should render correctly an external project with counter', () => {
    const wrapper = shallow(<ProjectPreviewExternalCounters {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly an external project without counters', () => {
    const wrapper = shallow(<ProjectPreviewExternalCounters {...propsWithoutCounter} />);
    expect(wrapper).toMatchSnapshot();
  });
});
