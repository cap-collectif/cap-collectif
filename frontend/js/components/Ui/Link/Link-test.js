// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { Link } from './Link';

describe('<Link />', () => {
  const props = {
    url: '/url.url',
  };

  it('renders correctly', () => {
    const wrapper = shallow(<Link {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
