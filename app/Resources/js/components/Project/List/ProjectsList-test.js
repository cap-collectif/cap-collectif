// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import { ProjectsList } from './ProjectsList';

const props = {
  projects: [
    {
      hasParticipativeStep: false,
      title: 'project without participative step',
    },
    {
      hasParticipativeStep: true,
      title: 'project with participative step',
    },
  ],
};

describe('<ProjectsList />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ProjectsList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
