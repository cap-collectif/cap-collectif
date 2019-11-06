// @flow
/* eslint-env jest */
/* TODO mke a true deep jest test; testing onSubmit and onupdate */
import React from 'react';
import { shallow } from 'enzyme';
import { EventFormPage } from './EventFormPage';
import { intlMock, $refType, $fragmentRefs } from '../../../mocks';

const defaultProps = {
  intl: intlMock,
  pristine: true,
  valid: true,
  submitting: true,
  submitSucceeded: true,
  submitFailed: true,
  invalid: true,
  dispatch: jest.fn(),
  event: {
    id: 'event1',
    viewerDidAuthor: true,
    $fragmentRefs,
    $refType,
  },
  query: {
    viewer: {
      isSuperAdmin: true,
    },
    $fragmentRefs,
    $refType,
  },
};

describe('<EventAdminFormPage />', () => {
  it('it renders correctly, with props at true', () => {
    const props = {
      ...defaultProps,
    };
    const wrapper = shallow(<EventFormPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders correctly, with props at false', () => {
    const props = {
      ...defaultProps,
      pristine: false,
      valid: false,
      submitting: false,
      submitSucceeded: false,
      submitFailed: false,
      invalid: false,
      query: {
        viewer: {
          isSuperAdmin: false,
        },
        $fragmentRefs,
        $refType,
      },
    };
    const wrapper = shallow(<EventFormPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders correctly, without event', () => {
    const props = {
      ...defaultProps,
      event: null,
    };
    const wrapper = shallow(<EventFormPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders correctly, with bad date', () => {
    const props = {
      ...defaultProps,
      pristine: false,
      valid: false,
      submitting: false,
      submitSucceeded: false,
      submitFailed: false,
      invalid: false,
      event: {
        id: 'event1',
        viewerDidAuthor: true,
        $fragmentRefs,
        $refType,
      },
      query: {
        viewer: {
          isSuperAdmin: false,
        },
        $fragmentRefs,
        $refType,
      },
    };
    const wrapper = shallow(<EventFormPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('it renders correctly, with  registration type', () => {
    const props = {
      ...defaultProps,
      pristine: false,
      valid: false,
      submitting: false,
      submitSucceeded: false,
      submitFailed: false,
      invalid: false,
      event: {
        id: 'event1',
        viewerDidAuthor: true,
        $fragmentRefs,
        $refType,
      },
      query: {
        viewer: {
          isSuperAdmin: false,
        },
        $fragmentRefs,
        $refType,
      },
    };
    const wrapper = shallow(<EventFormPage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
