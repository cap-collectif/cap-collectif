// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock, $refType } from '../../../mocks';
import { RegistrationForm } from './RegistrationForm';

describe('<RegistrationForm />', () => {
  const props = {
    addUserTypeField: false,
    addZipcodeField: false,
    addCaptchaField: true,
    addConsentExternalCommunicationField: true,
    addConsentInternalCommunicationField: true,
    handleSubmit: jest.fn(),
    userTypes: [],
    ...formMock,
    intl: intlMock,
    cguName: 'la charte',
    hasQuestions: false,
    responses: [],
    organizationName: 'Cap Collectif',
    internalCommunicationFrom: 'de Cap Collectif',
    dispatch: jest.fn(),
    shieldEnabled: false,
    privacyPolicyRequired: true,
  };

  const defaultQuery = {
    $refType,
    registrationScript: 'console.log("Jpec");',
  };

  it('renders a form with inputs and a captcha', () => {
    const wrapper = shallow(<RegistrationForm query={defaultQuery} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a form with user_type select if enabled', () => {
    const wrapper = shallow(
      <RegistrationForm
        query={defaultQuery}
        {...props}
        userTypes={[{ id: 1, name: 'type_1' }]}
        addUserTypeField
      />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a form with zipcode if enabled', () => {
    const wrapper = shallow(<RegistrationForm query={defaultQuery} {...props} addZipcodeField />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a form with dynamic fields', () => {
    const wrapper = shallow(<RegistrationForm query={defaultQuery} {...props} hasQuestions />);
    expect(wrapper).toMatchSnapshot();
  });
});
