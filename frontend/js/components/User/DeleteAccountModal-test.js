// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { DeleteAccountModal } from './DeleteAccountModal';
import { $refType } from '../../mocks';

describe('<DeleteAccountModal />', () => {
  const viewer = {
    $refType,
    contributionsCount: 20,
    votes: {
      totalCount: 10,
    },
    contributionsToDeleteCount: 5,
    id: 'userAdmin',
  };

  const props = {
    userDeletedIsNotViewer: true,
    handleClose: jest.fn(),
  };

  it('should render an visible modal', () => {
    const wrapper = shallow(<DeleteAccountModal show {...props} viewer={viewer} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should render an hidden modal', () => {
    const wrapper = shallow(<DeleteAccountModal show={false} viewer={viewer} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
