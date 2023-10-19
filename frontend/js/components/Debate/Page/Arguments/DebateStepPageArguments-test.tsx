/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { DebateStepPageArguments } from './DebateStepPageArguments'
import { $refType, $fragmentRefs } from '~/mocks'

const defaultProps = {
  step: {
    ' $refType': $refType,
    debate: {
      id: 'debat-cannabis',
      arguments: {
        totalCount: 7,
      },
      ' $fragmentRefs': $fragmentRefs,
    },
    yesDebate: {
      id: 'debat-cannabis',
      ' $fragmentRefs': $fragmentRefs,
    },
    noDebate: {
      id: 'debat-cannabis',
      ' $fragmentRefs': $fragmentRefs,
    },
  },
  viewer: {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
  },
  isMobile: false,
}
const props = {
  basic: defaultProps,
  isMobile: { ...defaultProps, isMobile: true },
  noViewer: { ...defaultProps, viewer: null },
}
describe('<DebateStepPageArguments />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<DebateStepPageArguments {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly on mobile', () => {
    const wrapper = shallow(<DebateStepPageArguments {...props.isMobile} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly when no viewer', () => {
    const wrapper = shallow(<DebateStepPageArguments {...props.noViewer} />)
    expect(wrapper).toMatchSnapshot()
  })
})
