// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import FooterLinks from './FooterLinks';

// TODO : write a test for the multilangue button when props are ready #9440
describe('<FooterLinks />', () => {
  it('renders correcty', () => {
    const props = {
      links: [],
      legals: { cookies: true, legal: true, privacy: true },
      cookiesText: "Quand je suis stressé je range les cookies dans une boite c'est comme ça",
      backgroundColor: '#FFF',
      multilingual: false,
      cookiesPath: '/cookies',
      privacyPath: '/privacy',
      legalPath: '/legals',
      textColor: '#000',
    };

    const wrapper = shallow(<FooterLinks {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
