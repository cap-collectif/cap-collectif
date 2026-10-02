/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { RegistrationEmailDomainsForm } from './RegistrationEmailDomainsForm'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<RegistrationEmailDomainsForm />', () => {
  const props = {
    submitting: false,
    handleSubmit: jest.fn(),
  }
  it('renders correctly', () => {
    const wrapper = shallow(<RegistrationEmailDomainsForm {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
