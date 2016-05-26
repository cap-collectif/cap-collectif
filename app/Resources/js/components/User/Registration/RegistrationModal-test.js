/* eslint-env mocha */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
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
    expect(wrapper.find('Modal')).to.have.length(1);
    expect(wrapper.find('Modal').prop('show')).to.equal(false);
  });

  it('renders modal if shown', () => {
    const wrapper = shallow(<RegistrationModal show features={{}} parameters={{}} {...props} />);
    expect(wrapper.find('Modal')).to.have.length(1);
    expect(wrapper.find('Modal').prop('show')).to.equal(true);
  });

  it('renders a form', () => {
    const wrapper = shallow(<RegistrationModal show features={{}} parameters={{}} {...props} />);
    const form = wrapper.find(RegistrationForm);
    expect(form).to.have.length(1);
    expect(form.prop('isSubmitting')).to.equal(wrapper.state('isSubmitting'));
    expect(form.prop('onSubmitFailure')).to.be.a('function');
    expect(form.prop('onValidationFailure')).to.be.a('function');
    expect(form.prop('onSubmitSuccess')).to.be.a('function');
  });

  it('renders a top text and a bottom text if specified', () => {
    const wrapper = shallow(<RegistrationModal show features={{}} parameters={parametersWithTexts} {...props} />);
    const topText = wrapper.find('Alert');
    expect(topText).to.have.length(1);
    expect(topText.prop('className')).to.equal('text-center');
    expect(topText.prop('bsStyle')).to.equal('info');
    const topMessage = topText.find('FormattedHTMLMessage');
    expect(topMessage.prop('message')).to.equal(parametersWithTexts['signin.text.top']);
    const bottomText = wrapper.find('.text-center.small.excerpt');
    expect(bottomText).to.have.length(1);
    const bottomMessage = bottomText.find('FormattedHTMLMessage');
    expect(bottomMessage.prop('message')).to.equal(parametersWithTexts['signin.text.bottom']);
  });
});
