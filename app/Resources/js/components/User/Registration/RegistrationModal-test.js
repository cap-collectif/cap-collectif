// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { RegistrationModal } from './RegistrationModal';
import IntlData from '../../../translations/FR';
import RegistrationForm from './RegistrationForm';

describe('<RegistrationModal />', () => {
  const props = {
    ...IntlData,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    submitting: false,
  };

  it('renders hidden modal if not shown', () => {
    const wrapper = shallow(<RegistrationModal show={false} features={{}} {...props} />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(false);
  });

  it('renders modal if shown', () => {
    const wrapper = shallow(<RegistrationModal show features={{}} {...props} />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(true);
  });

  it('renders a form', () => {
    const wrapper = shallow(<RegistrationModal show features={{}} {...props} />);
    const form = wrapper.find(RegistrationForm);
    expect(form).toHaveLength(1);
  });

  it('renders a top text and a bottom text if specified', () => {
    const top = 'Texte du haut';
    const bottom = 'Texte du bas';
    const wrapper = shallow(<RegistrationModal show features={{}} textTop={top} textBottom={bottom} {...props} />);
    const topText = wrapper.find('Alert');
    expect(topText).toHaveLength(1);
    expect(topText.prop('className')).toEqual('text-center');
    expect(topText.prop('bsStyle')).toEqual('info');
    const topMessage = topText.find('FormattedHTMLMessage');
    expect(topMessage.prop('message')).toEqual(top);
    const bottomText = wrapper.find('.text-center.small.excerpt');
    expect(bottomText).toHaveLength(1);
    const bottomMessage = bottomText.find('FormattedHTMLMessage');
    expect(bottomMessage.prop('message')).toEqual(bottom);
  });
});
