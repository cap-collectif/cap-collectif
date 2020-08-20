// @flow
/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';
import { intlMock, formMock, $refType, $fragmentRefs } from '~/mocks';
import { RegistrationForm } from './RegistrationForm';
import { simple as questions } from '~/utils/form/test/mocks';

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
    responses: [],
    organizationName: 'Cap Collectif',
    internalCommunicationFrom: 'de Cap Collectif',
    dispatch: jest.fn(),
    shieldEnabled: false,
    privacyPolicyRequired: true,
    questions,
  };

  const defaultQuery = {
    $refType,
    registrationScript: 'console.log("RIP Jpec");',
    registrationForm: {
      $fragmentRefs,
      questions,
    },
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
    const wrapper = shallow(<RegistrationForm query={defaultQuery} {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
