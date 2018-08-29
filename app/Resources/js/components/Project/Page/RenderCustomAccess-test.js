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
    $refType,
    $fragmentRefs,
  };

  it('should render correctly', () => {
    const wrapper = shallow(<RenderCustomAccess project={project} />);
    expect(wrapper).toMatchSnapshot();
  });
});
