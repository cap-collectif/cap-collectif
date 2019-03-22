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
      interlocutor: 'Cap Collectif',
      title: 'Contact form 1',
    },
  };

  it('should render correctly', () => {
    const wrapper = shallow(<ContactForm {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with a connected user', () => {
    const props = { ...defaultProps, user: { username: 'John Doe' } };
    const wrapper = shallow(<ContactForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with a captcha', () => {
    const props = { ...defaultProps, addCaptchaField: true };
    const wrapper = shallow(<ContactForm {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
