// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { $fragmentRefs, $refType } from '../../../mocks';

import { ProjectPreview } from './ProjectPreview';

const defaultProject = {
  project: {
    $refType,
    $fragmentRefs,
    id: 'project1',
  },
};

describe('<ProjectPreview />', () => {
  it('should render correctly project with participative step, without type', () => {
    const wrapper = shallow(<ProjectPreview {...defaultProject} />);
    expect(wrapper).toMatchSnapshot();
  });
});
