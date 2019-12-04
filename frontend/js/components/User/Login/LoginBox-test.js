// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { LoginBox } from './LoginBox';

describe('<LoginBox />', () => {
  const defaultProps = { textTop: '', textBottom: '', byPassAuth: false };

  it('renders', () => {
    const wrapper = shallow(<LoginBox {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without prefix', () => {
    const props = {
      ...defaultProps,
      prefix: '',
    };

    const wrapper = shallow(<LoginBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a top text and a bottom text if specified', () => {
    const props = {
      ...defaultProps,
      textTop: 'Texte du haut',
      textBottom: 'Texte du bas',
    };

    const wrapper = shallow(<LoginBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without LoginForm', () => {
    const props = {
      ...defaultProps,
      textTop: '',
      textBottom: '',
      byPassAuth: true,
    };

    const wrapper = shallow(<LoginBox {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
