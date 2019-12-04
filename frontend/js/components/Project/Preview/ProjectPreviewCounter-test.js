// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';

import ProjectPreviewCounter from './ProjectPreviewCounter';

describe('<ProjectPreviewCounter />', () => {
  it('should not render without value', () => {
    const wrapper = shallow(<ProjectPreviewCounter value={0} label="test" />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render with showZero = true', () => {
    const wrapper = shallow(<ProjectPreviewCounter value={0} showZero label="test" />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render render an icon with icon value', () => {
    const wrapper = shallow(<ProjectPreviewCounter value={1} label="test" icon="cap-icon" />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render correctly with value', () => {
    const wrapper = shallow(<ProjectPreviewCounter value={32} label="test" />);
    expect(wrapper).toMatchSnapshot();
  });
});
