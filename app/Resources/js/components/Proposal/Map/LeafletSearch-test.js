// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { LeafletSearch } from './LeafletSearch';
import { intlMock } from '../../../mocks';

const props = {
  intl: intlMock,
};

describe('<LeafletSearch />', () => {
  it('should render', () => {
    const wrapper = shallow(<LeafletSearch {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
