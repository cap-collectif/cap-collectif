/* eslint-env jest */
/* eslint no-unused-expressions:0 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { LoginModal } from './LoginModal';
import IntlData from '../../../translations/FR';

describe('<LoginModal />', () => {
  const props = {
    ...IntlData,
    onClose: () => {},
  };

  const parametersWithTexts = {
    'login.text.top': 'Texte du haut',
    'login.text.bottom': 'Texte du bas',
  };

  it('renders hidden modal if not shown', () => {
    const wrapper = shallow(<LoginModal show={false} features={{}} parameters={{}} {...props} />);
    expect(wrapper.find('Modal')).to.have.length(1);
    expect(wrapper.find('Modal').prop('show')).to.equal(false);
  });

  it('renders modal if shown', () => {
    const wrapper = shallow(<LoginModal show features={{}} parameters={{}} {...props} />);
    expect(wrapper.find('Modal')).to.have.length(1);
    expect(wrapper.find('Modal').prop('show')).to.equal(true);
  });

  it('renders a form', () => {
    const wrapper = shallow(<LoginModal show features={{}} parameters={{}} {...props} />);
    expect(wrapper.find('form')).to.have.length(1);
    expect(wrapper.find('form').prop('id')).to.equal('login-form');
  });

  it('renders a top text and a bottom text if specified', () => {
    const wrapper = shallow(<LoginModal show features={{}} parameters={parametersWithTexts} {...props} />);
    const topText = wrapper.find('Alert');
    expect(topText).to.have.length(1);
    expect(topText.prop('className')).to.equal('text-center');
    expect(topText.prop('bsStyle')).to.equal('info');
    const topMessage = topText.find('FormattedHTMLMessage');
    expect(topMessage.prop('message')).to.equal(parametersWithTexts['login.text.top']);
    const bottomText = wrapper.find('.text-center.small.excerpt');
    expect(bottomText).to.have.length(1);
    const bottomMessage = bottomText.find('FormattedHTMLMessage');
    expect(bottomMessage.prop('message')).to.equal(parametersWithTexts['login.text.bottom']);
  });
});
