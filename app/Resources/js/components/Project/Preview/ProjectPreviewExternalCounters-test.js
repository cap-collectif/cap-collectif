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
    contributors: { totalCount: 48 },
    votes: { totalCount: 48 },
    contributionsCount: 71,
  },
};

describe('<ProjectPreviewProgressBar />', () => {
  it('should render correctly counters without districts', () => {
    const wrapper = shallow(<ProjectPreviewExternalCounters {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
