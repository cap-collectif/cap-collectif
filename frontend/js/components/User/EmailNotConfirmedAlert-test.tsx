/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { EmailNotConfirmedAlert } from './EmailNotConfirmedAlert'
import { $refType } from '~/mocks'

describe('<EmailNotConfirmedAlert />', () => {
  const viewerNull = {
    ' $refType': $refType,
    email: null,
    isEmailConfirmed: null,
  }
  const viewerConfirmed = {
    ' $refType': $refType,
    email: 'updated-email@test.com',
    isEmailConfirmed: true,
  }
  const viewerNotConfirmed = {
    ' $refType': $refType,
    email: 'updated-email@test.com',
    isEmailConfirmed: false,
  }
  it('renders nothing if not logged', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert viewer={viewerNull} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders nothing if logged user has confirmed his email', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert viewer={viewerConfirmed} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders a button to resend confirmation & an alert if user is logged and has not confirmed his email', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert viewer={viewerNotConfirmed} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders a disabled button when resending', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert viewer={viewerNotConfirmed} />)
    wrapper.setState({
      resendingConfirmation: true,
    })
    expect(wrapper).toMatchSnapshot()
  })
  it('renders a disabled button when resending is done', () => {
    const wrapper = shallow(<EmailNotConfirmedAlert viewer={viewerNotConfirmed} />)
    wrapper.setState({
      confirmationSent: true,
    })
    expect(wrapper).toMatchSnapshot()
  })
})
