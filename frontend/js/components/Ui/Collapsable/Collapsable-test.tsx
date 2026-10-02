/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import Collapsable from '~ui/Collapsable'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Collapsable />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <Collapsable>
        <Collapsable.Button>
          <p>Tri</p>
        </Collapsable.Button>
        <Collapsable.Element ariaLabel="Contenu">
          <h1>Je suis caché hihi faut cliquer sur Tri pour me voir</h1>
        </Collapsable.Element>
      </Collapsable>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when aligned to right', () => {
    const wrapper = shallow(
      <Collapsable align="right">
        <Collapsable.Button>
          <p>Tri</p>
        </Collapsable.Button>
        <Collapsable.Element ariaLabel="Contenu">
          <h1>Je suis caché hihi faut cliquer sur Tri pour me voir</h1>
        </Collapsable.Element>
      </Collapsable>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when no aria-label provided', () => {
    const wrapper = shallow(
      <Collapsable align="right">
        <Collapsable.Button>
          <p>Tri</p>
        </Collapsable.Button>
        <Collapsable.Element>
          <h1>Je suis caché hihi faut cliquer sur Tri pour me voir</h1>
        </Collapsable.Element>
      </Collapsable>,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when disabled', () => {
    const wrapper = shallow(
      <Collapsable disabled>
        <Collapsable.Button>
          <p>Tri</p>
        </Collapsable.Button>
        <Collapsable.Element ariaLabel="Contenu">
          <h1>Je suis caché hihi faut cliquer sur Tri pour me voir</h1>
        </Collapsable.Element>
      </Collapsable>,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
