// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import ReadMoreLink from './ReadMoreLink';

describe('<ReadMoreLink />', () => {
  const emptyFunction = () => {};
  it('should not render anything if not visible', () => {
    const wrapper = shallow(
      <ReadMoreLink visible={false} expanded={false} onClick={emptyFunction} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a button with correct label if not expanded', () => {
    const wrapper = shallow(<ReadMoreLink visible expanded={false} onClick={emptyFunction} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render a button with correct label if expanded', () => {
    const wrapper = shallow(<ReadMoreLink visible expanded onClick={emptyFunction} />);
    expect(wrapper).toMatchSnapshot();
  });
});
