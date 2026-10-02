/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { Section } from './Section'
import { $refType, $fragmentRefs } from '../../mocks'

/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<Section />', () => {
  const defaultSection = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    contribuable: true,
    contributionsCount: 0,
    slug: 'slug',
    subtitle: 'subtitle',
    description: 'description',
    title: 'title',
  }
  const defaultProps = {
    section: { ...defaultSection },
    consultation: {
      ' $fragmentRefs': $fragmentRefs,
      ' $refType': $refType,
    },
    level: 0,
  }
  it('renders correcty', () => {
    const wrapper = shallow(<Section {...defaultProps} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders nothing when section not contribuable', () => {
    const props = { ...defaultProps, section: { ...defaultSection, contribuable: false } }
    const wrapper = shallow(<Section {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders nothing when hide section', () => {
    const props = { ...defaultProps, hideEmptySection: true }
    const wrapper = shallow(<Section {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
