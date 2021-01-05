// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import ModalOnboarding from './ModalOnboarding';

describe('<ModalOnboarding />', () => {
  it('should open when no key in local storage', () => {
    const wrapper = shallow(<ModalOnboarding />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should not open when key is set in local storage', () => {
    localStorage.setItem('emailing_discover', 'true');
    const wrapper = shallow(<ModalOnboarding />);
    expect(wrapper).toMatchSnapshot();
  });
});
