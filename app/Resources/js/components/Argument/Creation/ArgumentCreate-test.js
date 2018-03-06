// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { ArgumentCreate } from './ArgumentCreate';
import { formMock } from '../../../mocks';

describe('<ArgumentCreate />', () => {
  const props = {
    ...formMock,
    type: 'for',
    opinion: {},
    user: {},
    submitting: false,
    form: 'create-argument',
    dispatch: jest.fn()
  };

  it('renders correctly', () => {
    const wrapper = shallow(<ArgumentCreate {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
