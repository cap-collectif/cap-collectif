// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CommentSection } from './CommentSection';
import { intlMock } from '../../mocks';

const defaultProps = {
  intl: intlMock,
  commentableId: '1',
  isAuthenticated: true,
};

describe('<CommentSection />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentSection {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
