/* eslint-env jest */

import React from 'react';

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
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(false);
  });

  it('renders modal if shown', () => {
    const wrapper = shallow(<LoginModal show features={{}} parameters={{}} {...props} />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(true);
  });

  it('renders a form', () => {
    const wrapper = shallow(<LoginModal show features={{}} parameters={{}} {...props} />);
    expect(wrapper.find('form')).toHaveLength(1);
    expect(wrapper.find('form').prop('id')).toEqual('login-form');
  });

  it('renders a top text and a bottom text if specified', () => {
    const wrapper = shallow(<LoginModal show features={{}} parameters={parametersWithTexts} {...props} />);
    const topText = wrapper.find('Alert');
    expect(topText).toHaveLength(1);
    expect(topText.prop('className')).toEqual('text-center');
    expect(topText.prop('bsStyle')).toEqual('info');
    const topMessage = topText.find('FormattedHTMLMessage');
    expect(topMessage.prop('message')).toEqual(parametersWithTexts['login.text.top']);
    const bottomText = wrapper.find('.text-center.small.excerpt');
    expect(bottomText).toHaveLength(1);
    const bottomMessage = bottomText.find('FormattedHTMLMessage');
    expect(bottomMessage.prop('message')).toEqual(parametersWithTexts['login.text.bottom']);
  });
});
