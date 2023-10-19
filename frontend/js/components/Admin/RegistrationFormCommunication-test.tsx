/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { features } from '~/redux/modules/default'
import { RegistrationFormCommunication } from './RegistrationFormCommunication'
import { $refType, formMock, intlMock } from '~/mocks'

describe('<RegistrationFormCommunication />', () => {
  const props = {
    ...formMock,
    useTopText: true,
    useBottomText: true,
    submitting: false,
    handleSubmit: jest.fn(),
    features: { ...features },
    intl: intlMock,
    currentLanguage: 'fr-FR',
    registrationForm: {
      ' $refType': $refType,
      bottomTextDisplayed: false,
      topTextDisplayed: false,
      bottomText: '',
      topText: '',
      id: 'ceciEstUnForm',
      translations: [
        {
          bottomText: '',
          topText: '',
          locale: 'fr-FR',
        },
      ],
    },
  }
  it('renders correctly', () => {
    props.features.multilangue = false
    const wrapper = shallow(<RegistrationFormCommunication {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly with multilangue', () => {
    const wrapper = shallow(<RegistrationFormCommunication {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
