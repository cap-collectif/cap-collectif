// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { ContactForm } from './ContactForm';
import { formMock, intlMock, $refType } from '../../mocks';

describe('<ContactForm />', () => {
  const defaultProps = {
    ...formMock,
    addCaptchaField: false,
    user: null,
    intl: intlMock,
    contactForm: {
      $refType,
      body: '<p>This is a contact form body</p>',
      id: 'contactForm1',
      title: 'Contact form 1',
      confidentiality: 'This is our policy',
    },
    confidentiality: 'This is our policy',
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ContactForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with a connected user', () => {
    const props = {
      ...defaultProps,
      user: { username: 'John Doe' },
      confidentiality: 'This is our policy',
    };
    const wrapper = shallow(<ContactForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with a captcha', () => {
    const props = { ...defaultProps, addCaptchaField: true, confidentiality: 'This is our policy' };
    const wrapper = shallow(<ContactForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
