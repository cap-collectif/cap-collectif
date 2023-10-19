/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { DebateStepPageMainActions } from './DebateStepPageMainActions'
import { $refType, $fragmentRefs } from '~/mocks'

const defaultProps = {
  step: {
    title: 'Titre',
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    timeRange: {
      endAt: '2030-03-10 00:00:00',
    },
  },
  isMobile: false,
}
const props = {
  basic: defaultProps,
  isMobile: { ...defaultProps, isMobile: true },
}
describe('<DebateStepPageMainActions/>', () => {
  it('renders correctly', () => {
    const wrapper = shallow(<DebateStepPageMainActions {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correctly on mobile', () => {
    const wrapper = shallow(<DebateStepPageMainActions {...props.isMobile} />)
    expect(wrapper).toMatchSnapshot()
  })
})
