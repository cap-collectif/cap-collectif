// @flow
/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { EventEditButton } from './EventEditButton';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<EventEditButton />', () => {
  it('it renders correctly', () => {
    const props = {
      event: {
        author: { slug: '/metal' },
        $fragmentRefs,
        $refType,
      },
      query: {
        $fragmentRefs,
        $refType,
      },
    };
    const wrapper = shallow(<EventEditButton {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
