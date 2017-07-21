// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { LoginBox } from './LoginBox';
import IntlData from '../../../translations/FR';

describe('<LoginBox />', () => {
  const props = {
    ...IntlData,
  };

  const texts = {
    textTop: 'Texte du haut',
    textBottom: 'Texte du bas',
  };

  it('renders', () => {
    const wrapper = shallow(<LoginBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a top text and a bottom text if specified', () => {
    const wrapper = shallow(<LoginBox {...props} {...texts} />);
    const topText = wrapper.find('Alert');
    expect(topText).toHaveLength(1);
    expect(topText.prop('className')).toEqual('text-center');
    expect(topText.prop('bsStyle')).toEqual('info');
    const topMessage = topText.find('FormattedHTMLMessage');
    expect(topMessage.prop('message')).toEqual(texts.textTop);
    const bottomText = wrapper.find('.text-center.small.excerpt');
    expect(bottomText).toHaveLength(1);
    const bottomMessage = bottomText.find('FormattedHTMLMessage');
    expect(bottomMessage.prop('message')).toEqual(texts.textBottom);
  });
});
