// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { OpinionList } from './OpinionList';
import { intlMock } from '../../mocks';

describe('<OpinionList />', () => {
  const props = {
    section: {},
    consultation: {},
    intl: intlMock
  };

  it('renders correcty', () => {
    const wrapper = shallow(<OpinionList {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
