/* eslint-env jest */
import * as React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import BreadCrumbItem from './BreadCrumbItem'

describe('<BreadCrumbItem />', () => {
  let testComponentTree: any

  it('should render link with href when link is not active', () => {
    testComponentTree = ReactTestRenderer.create(
      <BreadCrumbItem title="Project List" href="/projects" isActive={false} />,
    )
    expect(testComponentTree).toMatchSnapshot()
  })

  it('should render a text when link is active', () => {
    testComponentTree = ReactTestRenderer.create(<BreadCrumbItem title="Project List" href="/projects" isActive />)
    expect(testComponentTree).toMatchSnapshot()
  })
})
