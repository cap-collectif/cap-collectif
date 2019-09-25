// @flow
/* eslint-env jest */
import * as React from 'react';
import { shallow } from 'enzyme';
import { RegistrationModal } from './RegistrationModal';
import { $refType } from '../../../mocks';

describe('<RegistrationModal />', () => {
  const props = {
    onClose: jest.fn(),
    textTop: null,
    textBottom: null,
    onSubmit: jest.fn(),
    submitting: false,
    displayChartModal: false,
    onCloseChart: jest.fn(),
    charterBody: 'Super charte !!',
  };

  const defaultQuery = {
    $refType,
    registrationScript: 'console.log("Jpec");',
  };

  it('renders hidden modal if not shown', () => {
    const wrapper = shallow(<RegistrationModal query={defaultQuery} {...props} show={false} />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(false);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders modal if shown', () => {
    const wrapper = shallow(<RegistrationModal query={defaultQuery} {...props} show />);
    expect(wrapper.find('Modal')).toHaveLength(1);
    expect(wrapper.find('Modal').prop('show')).toEqual(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a form', () => {
    const wrapper = shallow(<RegistrationModal query={defaultQuery} {...props} show />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a top text and a bottom text if specified', () => {
    const top = 'Texte du haut';
    const bottom = 'Texte du bas';
    const wrapper = shallow(
      <RegistrationModal query={defaultQuery} {...props} show textTop={top} textBottom={bottom} />,
    );
    const topText = wrapper.find('Alert');
    expect(topText).toHaveLength(1);
    expect(topText.prop('className')).toEqual('text-center');
    expect(topText.prop('bsStyle')).toEqual('info');
    expect(wrapper).toMatchSnapshot();
  });
});
