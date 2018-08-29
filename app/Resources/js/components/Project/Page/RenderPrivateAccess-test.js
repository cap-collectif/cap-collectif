// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RenderPrivateAccess } from './RenderPrivateAccess';
import { $refType } from '../../../mocks';

describe('<RenderPrivateAccess />', () => {
  const projectVisibleByMe = {
    visibility: 'ME',
    $refType,
  };
  const projectVisibleByAdmin = {
    visibility: 'ADMIN',
    $refType,
  };
  it('should render correctly for me only', () => {
    const wrapper = shallow(
      <RenderPrivateAccess project={projectVisibleByMe} lockIcon="cap-lock-1" />,
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly for admin only', () => {
    const wrapper = shallow(<RenderPrivateAccess project={projectVisibleByAdmin} />);
    expect(wrapper).toMatchSnapshot();
  });
});
