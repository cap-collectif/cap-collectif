// @flow
/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';
import { EventCreateModal } from './EventCreateModal';
import { intlMock, $refType, $fragmentRefs } from '../../../mocks';

describe('<EventCreateModal />', () => {
  it('it renders correctly', () => {
    const props = {
      intl: intlMock,
      show: false,
      invalid: true,
      submitting: false,
      handleClose: jest.fn(),
      dispatch: jest.fn(),
      event: {
        $fragmentRefs,
        $refType,
      },
      query: {
        $fragmentRefs,
        $refType,
      },
    };
    const wrapper = shallow(<EventCreateModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
