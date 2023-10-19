/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { AccountForm } from './AccountForm'
import { features } from '~/redux/modules/default'
import { intlMock, formMock, $refType, $fragmentRefs } from '~/mocks'

describe('<AccountForm />', () => {
  const defaultViewer = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    locale: 'fr-FR',
    email: 'initial-email@gmail.fr',
    facebookId: null,
    isFranceConnectAccount: false,
    newEmailToConfirm: null,
    hasPassword: true,
  }
  const props = {
    ...formMock,
    currentLanguage: 'fr-FR',
    features,
    ssoList: [],
    languageList: [
      {
        translationKey: 'french',
        code: 'fr-FR',
      },
      {
        translationKey: 'english',
        code: 'en-GB',
      },
    ],
    viewer: defaultViewer,
    loginWithOpenId: false,
    intl: intlMock,
    dispatch: jest.fn(),
    handleSubmit: jest.fn(),
    initialValues: {
      email: 'initial-email@gmail.fr',
    },
  }
  it('should render a form', () => {
    const wrapper = shallow(<AccountForm {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a form with an alert if submitted password is wrong', () => {
    const wrapper = shallow(<AccountForm {...props} error="user.confirm.wrong_password" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a form with associated account', () => {
    const franceConnectViewer = { ...defaultViewer, hasPassword: false, isFranceConnectAccount: true }
    const Props = { ...props, viewer: { ...franceConnectViewer } }
    const wrapper = shallow(<AccountForm {...Props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a form with information about new email', () => {
    const wrapper = shallow(<AccountForm {...props} newEmailToConfirm="new-email@test.com" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a form with an info if a confirmation email has been resent', () => {
    const wrapper = shallow(<AccountForm {...props} newEmailToConfirm="new-email@test.com" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render with button to delete account only', () => {
    const wrapper = shallow(<AccountForm {...props} loginWithOpenId newEmailToConfirm="new-email@test.com" />)
    expect(wrapper).toMatchSnapshot()
  })
})
