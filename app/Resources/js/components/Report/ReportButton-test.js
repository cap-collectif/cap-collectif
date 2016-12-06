/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ReportButton } from './ReportButton';
import IntlData from '../../translations/FR';

describe('<ReportButton />', () => {
  const defaultProps = {
    ...IntlData,
    id: 'opinion-1',
    user: {},
    reported: false,
    onClick: () => {},
  };

  it('renders clickable button', () => {
    const button = shallow(<ReportButton {...defaultProps} />).find('Connect(LoginOverlay)').find('Button');
    expect(button.prop('id')).toEqual('report-opinion-1-button');
    expect(button.prop('onClick')).toBeDefined();
    expect(button.prop('bsSize')).toEqual(null);
    expect(button.prop('style')).toEqual({});
    expect(button.prop('className')).toEqual('btn--outline btn-dark-gray ');
    expect(button.prop('active')).toEqual(false);
  });

  it('renders a reported button', () => {
    const button = shallow(<ReportButton {...defaultProps} reported />).find('Connect(LoginOverlay)').find('Button');
    expect(button).toHaveLength(1);
    expect(button.prop('onClick')).toEqual(null);
    expect(button.prop('active')).toEqual(true);
  });
});
