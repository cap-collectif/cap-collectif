// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LoginBox } from './LoginBox';

describe('<LoginBox />', () => {
  const props = { textTop: '', textBottom: '' };

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
    expect(wrapper).toMatchSnapshot();
  });
});
