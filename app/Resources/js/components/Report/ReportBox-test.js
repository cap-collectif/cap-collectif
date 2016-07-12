/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { ReportBox } from './ReportBox';
import IntlData from '../../translations/FR';

describe('<ReportBox />', () => {
  const defaultProps = {
    ...IntlData,
    dispatch: () => {},
    showModal: false,
    onReport: () => {},
    reported: false,
    show: false,
    features: { reporting: true },
    user: { uniqueId: 'michel' },
    author: { uniqueId: 'pierre' },
  };

  it('renders a report button and a modal', () => {
    const wrapper = shallow(<ReportBox {...defaultProps} />);
    const button = wrapper.find('ReportButton');
    expect(button).to.have.length(1);
    expect(button.prop('id')).to.equal('report-button');
    expect(button.prop('reported')).to.equal(defaultProps.reported);
    expect(button.prop('onClick')).to.be.a.function;
    expect(button.prop('bsSize')).to.equal(null);
    expect(button.prop('style')).to.deep.equal({});
    expect(button.prop('className')).to.equal('');
    const modal = wrapper.find('Connect(ReportModal)');
    expect(modal).to.have.length(1);
    expect(modal.prop('show')).to.equal(defaultProps.show);
    expect(modal.prop('onSubmit')).to.be.a.function;
  });

  it('renders nothing if reporting is not enabled', () => {
    const wrapper = shallow(<ReportBox {...defaultProps} features={{ reporting: false }} />);
    expect(wrapper.children().isEmpty()).to.be.true;
  });

  it('renders a ReportButton if not logged in', () => {
    const wrapper = shallow(<ReportBox {...defaultProps} user={null} />);
    const button = wrapper.find('ReportButton');
    expect(button).to.have.length(1);
  });

  it('renders nothing if logged user is the author', () => {
    const wrapper = shallow(<ReportBox {...defaultProps} author={defaultProps.user} />);
    expect(wrapper.children().isEmpty()).to.be.true;
  });
});
