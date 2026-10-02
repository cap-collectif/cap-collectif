/* eslint-env jest */
import { render } from '@testing-library/react'
import BreadCrumbItem from './BreadCrumbItem'

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<BreadCrumbItem />', () => {
  it('should render link with href when link is not active', () => {
    const { asFragment } = render(<BreadCrumbItem title="Project List" href="/projects" isActive={false} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render a text when link is active', () => {
    const { asFragment } = render(<BreadCrumbItem title="Project List" href="/projects" isActive />)
    expect(asFragment()).toMatchSnapshot()
  })
})
