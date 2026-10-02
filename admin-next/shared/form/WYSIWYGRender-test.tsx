/* eslint-env jest */
import { render } from '@testing-library/react'
import WYSIWYGRender from './WYSIWYGRender'
import MockProviders from 'tests/testUtils'

const props = {
  value: '<div>Little test</div>',
  className: 'myClass',
}

const getTree = props =>
  render(
    <MockProviders>
      <WYSIWYGRender {...props} />
    </MockProviders>,
  )

/**
 * @jest-status non-compliant
 * @jest-reason Checks only a snapshot; add explicit assertions for the observable result.
 */
describe('<WYSIWYGRender />', () => {
  it('should render correctly', () => {
    expect(getTree(props)).toMatchSnapshot()
  })
  it('should render correctly with tagName', () => {
    expect(getTree({ ...props, tagName: 'i' })).toMatchSnapshot()
  })
})
