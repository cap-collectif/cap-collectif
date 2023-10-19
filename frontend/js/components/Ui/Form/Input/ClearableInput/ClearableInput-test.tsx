/* eslint-env jest */
import React from 'react'
import { shallow, mount } from 'enzyme'
import ClearableInput from '~ui/Form/Input/ClearableInput'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'

describe('<ClearableInput />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<ClearableInput id="search" name="search" type="text" placeholder="Rechercher" />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should show a clear icon when typing a value', () => {
    const wrapper = mount(<ClearableInput id="search" name="search" type="text" placeholder="Rechercher" />)
    expect(wrapper.find('ClearableInput__CloseIcon').exists()).toBeFalsy()
    wrapper.find('input').simulate('change', {
      target: {
        value: 'Yo tout le monde c squeezie',
      },
    })
    expect(wrapper.find('ClearableInput__CloseIcon').exists()).toBeTruthy()
  })
  it('should correctly clear the text when clicking on the clear button', () => {
    const wrapper = mount(<ClearableInput id="search" name="search" type="text" placeholder="Rechercher" />)
    wrapper.find('input').simulate('change', {
      target: {
        value: 'Yo tout le monde c squeezie',
      },
    })
    expect(wrapper.find('input').props().value).toBe('Yo tout le monde c squeezie')
    wrapper.find('ClearableInput__CloseIcon').simulate('click')
    expect(wrapper.find('input').props().value).toBe('')
  })
  it('should render correctly with a svg icon', () => {
    const wrapper = shallow(
      <ClearableInput
        id="search"
        name="search"
        icon={<Icon name={ICON_NAME.twitter} />}
        type="text"
        placeholder="Rechercher"
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with a font icon', () => {
    const wrapper = shallow(
      <ClearableInput
        id="search"
        name="search"
        icon={<i className="cap cap-magnifier" />}
        type="text"
        placeholder="Rechercher"
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when disabled', () => {
    const wrapper = shallow(<ClearableInput id="search" name="search" type="text" placeholder="Rechercher" disabled />)
    expect(wrapper).toMatchSnapshot()
  })
})
