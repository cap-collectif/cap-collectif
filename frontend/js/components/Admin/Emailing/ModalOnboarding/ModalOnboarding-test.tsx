/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import ModalOnboarding from './ModalOnboarding'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ModalOnboarding />', () => {
  it('should open when no key in local storage', () => {
    const wrapper = shallow(<ModalOnboarding isOnlyProjectAdmin={false} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should not open when key is set in local storage', () => {
    localStorage.setItem('emailing_discover', 'true')
    const wrapper = shallow(<ModalOnboarding isOnlyProjectAdmin={false} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should have `announcement.emailing.new.tool.project.admin` in modal when user is project admin ', () => {
    const wrapper = shallow(<ModalOnboarding isOnlyProjectAdmin />)
    expect(wrapper).toMatchSnapshot()
  })
})
