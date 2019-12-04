// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { $refType } from '../../../mocks';

import { ProjectType } from './ProjectType';

const defaultProps = {
  project: {
    $refType,
    type: null,
  },
};

const projectWithType = {
  project: {
    $refType,
    type: { title: 'presentation', color: '#337ab7' },
  },
};

describe('<ProjectPreview />', () => {
  it('should render correctly project type', () => {
    const wrapper = shallow(<ProjectType {...projectWithType} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly project with null type', () => {
    const wrapper = shallow(<ProjectType {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
