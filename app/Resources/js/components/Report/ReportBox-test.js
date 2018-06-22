// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ReportBox } from './ReportBox';

describe('<ReportBox />', () => {
  const defaultProps = {
    id: 'opinion-1',
    dispatch: jest.fn(),
    showModal: false,
    onReport: jest.fn(),
    reported: false,
    show: false,
    features: { reporting: true },
    user: { uniqueId: 'michel' },
    author: { uniqueId: 'pierre' },
    buttonClassName: 'test-button-classNAme',
  };

  it('renders a report button and a modal', () => {
    const wrapper = shallow(<ReportBox {...defaultProps} />);
    const button = wrapper.find('Connect(ReportButton)');
    expect(button).toHaveLength(1);
    expect(button.prop('id')).toEqual(defaultProps.id);
    expect(button.prop('reported')).toEqual(defaultProps.reported);
    expect(button.prop('onClick')).toBeDefined();
    expect(button.prop('bsSize')).toEqual(null);
    expect(button.prop('style')).toEqual({});
    expect(button.prop('className')).toEqual(defaultProps.buttonClassName);
    const modal = wrapper.find('Connect(ReportModal)');
    expect(modal).toHaveLength(1);
    expect(modal.prop('show')).toEqual(defaultProps.show);
    expect(modal.prop('onSubmit')).toBeDefined();
  });

  it('renders nothing if reporting is not enabled', () => {
    const wrapper = shallow(<ReportBox {...defaultProps} features={{ reporting: false }} />);
    expect(wrapper.children().exists()).toEqual(false);
  });

  it('renders a ReportButton if not logged in', () => {
    const wrapper = shallow(<ReportBox {...defaultProps} />);
    const button = wrapper.find('Connect(ReportButton)');
    expect(button).toHaveLength(1);
  });

  it('renders nothing if logged user is the author', () => {
    const wrapper = shallow(<ReportBox {...defaultProps} author={defaultProps.user} />);
    expect(wrapper.children().exists()).toEqual(false);
  });
});
