/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { intlMock, formMock, $refType, $fragmentRefs } from '~/mocks'
import { RegistrationForm } from './RegistrationForm'
import { simple as questions } from '~/utils/form/mocks'

export const basicProps = {
  ...formMock,
  addUserTypeField: false,
  addZipcodeField: false,
  addCaptchaField: true,
  addConsentExternalCommunicationField: true,
  addConsentInternalCommunicationField: true,
  userTypes: [],
  intl: intlMock,
  cguName: 'la charte',
  responses: [],
  organizationName: 'Cap Collectif',
  internalCommunicationFrom: 'de Cap Collectif',
  shieldEnabled: false,
  privacyPolicyRequired: true,
  questions,
  locale: 'fr-FR',
  query: {
    ' $refType': $refType,
    registrationScript: 'console.log("RIP Jpec");',
    registrationForm: {
      ' $fragmentRefs': $fragmentRefs,
      questions,
    },
  },
}
const props = {
  basic: basicProps,
  withUserTypeEnabled: {
    ...basicProps,
    userTypes: [
      {
        id: 1,
        name: 'type_1',
      },
    ],
    addUserTypeField: true,
  },
  withZipcodeEnabled: { ...basicProps, addZipcodeField: true },
}
describe('<RegistrationForm />', () => {
  it('renders a form with inputs and a captcha', () => {
    const wrapper = shallow(<RegistrationForm {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders a form with user_type enabled', () => {
    const wrapper = shallow(<RegistrationForm {...props.withUserTypeEnabled} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders a form with zipcode enabled', () => {
    const wrapper = shallow(<RegistrationForm {...props.withZipcodeEnabled} />)
    expect(wrapper).toMatchSnapshot()
  })
})
