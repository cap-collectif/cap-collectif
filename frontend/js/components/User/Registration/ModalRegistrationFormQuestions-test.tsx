/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { intlMock, formMock, $refType } from '~/mocks'
import { ModalRegistrationFormQuestions } from './ModalRegistrationFormQuestions'
import { simple as questions } from '~/utils/form/mocks'

describe('<ModalRegistrationFormQuestions/>', () => {
  const props = {
    change: jest.fn(),
    intl: intlMock,
    ...formMock,
    form: 'registration-form',
    responses: [],
    registrationForm: {
      ' $refType': $refType,
      questions,
    },
    memoizeAvailableQuestions: {
      cache: {
        get: jest.fn(),
      },
    },
  }
  it('renders a form with dynamic fields', () => {
    const wrapper = shallow(<ModalRegistrationFormQuestions {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
