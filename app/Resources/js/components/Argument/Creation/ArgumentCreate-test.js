// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ArgumentCreate } from './ArgumentCreate';
import { formMock, $refType } from '../../../mocks';

describe('<ArgumentCreate />', () => {
  const props = {
    ...formMock,
    type: 'FOR',
    argumentable: { id: 'opinion1', $refType, contribuable: true },
    user: { id: 'user1', isEmailConfirmed: true },
    submitting: false,
    form: 'create-argument',
    dispatch: jest.fn(),
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ArgumentCreate {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
