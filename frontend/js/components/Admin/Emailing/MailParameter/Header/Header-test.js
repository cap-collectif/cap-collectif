// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { Header } from './Header';
import { $refType } from '~/mocks';

const baseProps = {
  title: 'Ceci est un titre',
  disabled: false,
  showError: false,
  errors: {},
  emailingCampaign: {
    $refType,
    status: 'DRAFT',
  },
  setModalCancelOpen: jest.fn(),
  submitting: false,
};

const props = {
  basic: baseProps,
  disabled: {
    ...baseProps,
    disabled: true,
    emailingCampaign: {
      $refType,
      status: 'SENT',
    },
  },
  withError: {
    ...baseProps,
    showError: true,
    errors: {
      blabla: {
        id: 'key-word',
        values: { fieldName: 'blabla-field' },
      },
    },
  },
};

describe('<Header />', () => {
  it('should renders correctly', () => {
    const wrapper = shallow(<Header {...props.basic} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when disabled', () => {
    const wrapper = shallow(<Header {...props.disabled} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should renders correctly when error', () => {
    const wrapper = shallow(<Header {...props.withError} />);
    expect(wrapper).toMatchSnapshot();
  });
});
