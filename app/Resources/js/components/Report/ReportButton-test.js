/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
    const button = shallow(<ReportButton {...defaultProps} />)
                    .find('Connect(LoginOverlay)')
                    .find('Button');
    expect(button.prop('id')).to.equal('report-opinion-1-button');
    expect(button.prop('onClick')).to.be.a.function;
    expect(button.prop('bsSize')).to.equal(null);
    expect(button.prop('style')).to.deep.equal({});
    expect(button.prop('className')).to.equal('btn--outline btn-dark-gray ');
    expect(button.prop('active')).to.be.false;
  });

  it('renders a reported button', () => {
    const button = shallow(<ReportButton {...defaultProps} reported />)
                  .find('Connect(LoginOverlay)')
                  .find('Button');
    expect(button).to.have.length(1);
    expect(button.prop('onClick')).to.be.null;
    expect(button.prop('active')).to.be.true;
  });
});
