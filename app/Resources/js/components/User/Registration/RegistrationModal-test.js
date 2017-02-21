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
    onClose: () => {},
  };

  const parametersWithTexts = {
    'signin.text.top': 'Texte du haut',
    'signin.text.bottom': 'Texte du bas',
  };

  it('renders hidden modal if not shown', () => {
    const wrapper = shallow(<RegistrationModal show={false} features={{}} parameters={{}} {...props} />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(false);
  });

  it('renders modal if shown', () => {
    const wrapper = shallow(<RegistrationModal show features={{}} parameters={{}} {...props} />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(true);
  });

  it('renders a form', () => {
    const wrapper = shallow(<RegistrationModal show features={{}} parameters={{}} {...props} />);
    const form = wrapper.find(RegistrationForm);
    expect(form).toHaveLength(1);
    expect(form.prop('onSubmitFail')).toBeDefined();
    expect(form.prop('onSubmitSuccess')).toBeDefined();
  });

  it('renders a top text and a bottom text if specified', () => {
    const wrapper = shallow(<RegistrationModal show features={{}} parameters={parametersWithTexts} {...props} />);
    const topText = wrapper.find('Alert');
    expect(topText).toHaveLength(1);
    expect(topText.prop('className')).toEqual('text-center');
    expect(topText.prop('bsStyle')).toEqual('info');
    const topMessage = topText.find('FormattedHTMLMessage');
    expect(topMessage.prop('message')).toEqual(parametersWithTexts['signin.text.top']);
    const bottomText = wrapper.find('.text-center.small.excerpt');
    expect(bottomText).toHaveLength(1);
    const bottomMessage = bottomText.find('FormattedHTMLMessage');
    expect(bottomMessage.prop('message')).toEqual(parametersWithTexts['signin.text.bottom']);
  });
});
