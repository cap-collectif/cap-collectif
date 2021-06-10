// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RenderCustomAccess } from './RenderCustomAccess';
import { $fragmentRefs, $refType } from '../../../mocks';

describe('<RenderCustomAccess />', () => {
  const project = {
    restrictedViewers: {
      totalUserCount: 15,
    },
    archived: false,
    $refType,
    $fragmentRefs,
  };

  const archivedProject = {
    ...project,
    archived: true,
  };

  it('should render correctly', () => {
    const wrapper = shallow(<RenderCustomAccess project={project} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with archived project', () => {
    const wrapper = shallow(<RenderCustomAccess project={archivedProject} />);
    expect(wrapper).toMatchSnapshot();
  });
});
