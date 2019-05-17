/* @flow */
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { Tag } from './Tag';

const children = 'Label';

describe('<Tag />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Tag id="example">{children}</Tag>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render an icon if defined', () => {
    const wrapper = shallow(<Tag icon="cap cap-icon">{children}</Tag>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render with different html tag', () => {
    const wrapper = shallow(
      <Tag as="span" icon="cap cap-icon">
        {children}
      </Tag>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a specific container for link', () => {
    const wrapper = shallow(
      <Tag as="span" href="#" icon="cap cap-icon">
        {children}
      </Tag>,
    );
    expect(wrapper).toMatchSnapshot();
  });
});
