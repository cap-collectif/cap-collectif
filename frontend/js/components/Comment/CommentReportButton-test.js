// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { CommentReportButton } from './CommentReportButton';
import { $refType } from '../../mocks';

const defaultProps = {
  dispatch: jest.fn(),
  comment: {
    $refType,
    id: '1',
    author: {
      slug: 'thisisaslug',
    },
  },
};

describe('<CommentReportButton />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<CommentReportButton {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
