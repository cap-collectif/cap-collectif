// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { RegistrationModal } from './RegistrationModal';
import RegistrationForm from './RegistrationForm';

describe('<RegistrationModal />', () => {
  const props = {
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    submitting: false
  };

  it('renders hidden modal if not shown', () => {
    const wrapper = shallow(<RegistrationModal show={false} features={{}} {...props} />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(false);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders modal if shown', () => {
    const wrapper = shallow(<RegistrationModal show features={{}} {...props} />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a form', () => {
    const wrapper = shallow(<RegistrationModal show features={{}} {...props} />);
    const form = wrapper.find(RegistrationForm);
    expect(form).toHaveLength(1);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a top text and a bottom text if specified', () => {
    const top = 'Texte du haut';
    const bottom = 'Texte du bas';
    const wrapper = shallow(
      <RegistrationModal show features={{}} textTop={top} textBottom={bottom} {...props} />
    );
    const topText = wrapper.find('Alert');
    expect(topText).toHaveLength(1);
    expect(topText.prop('className')).toEqual('text-center');
    expect(topText.prop('bsStyle')).toEqual('info');
    expect(wrapper).toMatchSnapshot();
  });
});
