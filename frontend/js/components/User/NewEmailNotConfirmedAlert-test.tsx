/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { NewEmailNotConfirmedAlert } from './NewEmailNotConfirmedAlert'
import { $refType } from '~/mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<NewEmailNotConfirmedAlert />', () => {
  const viewer = {
    ' $refType': $refType,
    newEmailToConfirm: 'new-email-to-confirm@test.com',
  }
  it('should render nothing if no newEmailToConfirm', () => {
    const wrapper = shallow(<NewEmailNotConfirmedAlert viewer={null} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render an alert if there is a newEmailToConfirm', () => {
    const wrapper = shallow(<NewEmailNotConfirmedAlert viewer={viewer} />)
    expect(wrapper).toMatchSnapshot()
  })
})
