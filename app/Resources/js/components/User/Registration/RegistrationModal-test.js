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
    registrationScript: '<script>console.log("Jpec");</script>',
  };

  it('renders hidden modal if not shown', () => {
    const wrapper = shallow(<RegistrationModal query={defaultQuery} {...props} show={false} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders modal if shown', () => {
    const wrapper = shallow(<RegistrationModal query={defaultQuery} {...props} show />);

    expect(wrapper).toMatchSnapshot();
  });

  it('renders modal and chart', () => {
    const wrapper = shallow(
      <RegistrationModal query={defaultQuery} {...props} show displayChartModal />,
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders modal and not chart', () => {
    const wrapper = shallow(
      <RegistrationModal query={defaultQuery} {...props} show displayChartModal={false} />,
    );

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
