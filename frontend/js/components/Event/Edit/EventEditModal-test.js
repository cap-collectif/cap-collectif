// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { EventEditModal } from './EventEditModal';
import { $refType, $fragmentRefs } from '~/mocks';

describe('<EventEditModal />', () => {
  it('it renders correctly', () => {
    const props = {
      show: false,
      submitting: false,
      pristine: false,
      handleClose: jest.fn(),
      dispatch: jest.fn(),
      event: {
        $fragmentRefs,
        $refType,
        participants: {
          totalCount: 0,
        },
      },
      query: {
        $fragmentRefs,
        $refType,
      },
    };
    const wrapper = shallow(<EventEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('it renders correctly with participants', () => {
    const props = {
      show: false,
      submitting: false,
      pristine: false,
      handleClose: jest.fn(),
      dispatch: jest.fn(),
      event: {
        $fragmentRefs,
        $refType,
        participants: {
          totalCount: 10,
        },
      },
      query: {
        $fragmentRefs,
        $refType,
      },
    };
    const wrapper = shallow(<EventEditModal {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
