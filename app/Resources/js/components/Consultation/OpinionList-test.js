// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionList } from './OpinionList';

describe('<OpinionList />', () => {
  const props = {
    section: {},
    consultation: {},
    intl: global.intlMock,
  };

  it('renders correcty', () => {
    const wrapper = shallow(<OpinionList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
