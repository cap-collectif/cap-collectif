/* eslint-env jest */
import * as React from 'react'
import { mount } from 'enzyme'
import ConditionalWrapper from './ConditionalWrapper'

describe('<ConditionalWrapper />', () => {
  it('renders the wrapper when the condition is true', () => {
    const wrapper = mount(
      <ConditionalWrapper when={1 + 1 === 2} wrapper={children => <div id="wrapper">{children}</div>}>
        <p id="children">Salut</p>
      </ConditionalWrapper>,
    )
    expect(
      wrapper.childAt(0).equals(
        <div id="wrapper">
          <p id="children">Salut</p>
        </div>,
      ),
    ).toBe(true)
  })
  it('does not render the wrapper when the condition is false', () => {
    const wrapper = mount(
      <ConditionalWrapper when={1 + 1 === 10} wrapper={children => <div id="wrapper">{children}</div>}>
        <p id="children">Salut</p>
      </ConditionalWrapper>,
    )
    expect(wrapper.childAt(0).equals(<p id="children">Salut</p>)).toBe(true)
  })
})
