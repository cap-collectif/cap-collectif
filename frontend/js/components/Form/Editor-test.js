/* eslint-env jest */
/* @flow */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock } from '../../mocks';
import { Editor } from './Editor';

describe('q<Editor />', () => {
  const defaultProps = {
    intl: intlMock,
    onChange: jest.fn(),
    onBlur: jest.fn(),
    className: 'test',
    value: 'test',
    id: 'azerty',
    disabled: true,
  };

  it('should render correctly with defaultProps', () => {
    const wrapper = shallow(<Editor {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
