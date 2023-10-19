/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import VoteView from './VoteView'

describe('<VoteView />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<VoteView positivePercentage={42} votesCount={null} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly on mobile', () => {
    const wrapper = shallow(<VoteView positivePercentage={42} votesCount={null} isMobile />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when 100% positive', () => {
    const wrapper = shallow(<VoteView positivePercentage={100} votesCount={null} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when 100% positive on mobile', () => {
    const wrapper = shallow(<VoteView positivePercentage={100} votesCount={null} isMobile />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when 0% positive', () => {
    const wrapper = shallow(<VoteView positivePercentage={0} votesCount={null} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when 0% positive on mobile', () => {
    const wrapper = shallow(<VoteView positivePercentage={0} votesCount={null} isMobile />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should not render when our ouf range percentage', () => {
    const wrapper = shallow(<VoteView positivePercentage={-45674} votesCount={null} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should not render when our ouf range percentage on mobile', () => {
    const wrapper = shallow(<VoteView positivePercentage={-45674} votesCount={null} isMobile />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when NaN', () => {
    const wrapper = shallow(<VoteView positivePercentage={Number.NaN} votesCount={null} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should not render when step is finished', () => {
    const wrapper = shallow(
      <VoteView
        positivePercentage={43}
        votesCount={{
          FOR: 12,
          AGAINST: 15,
        }}
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
  it('should not render when step is finished on mobile', () => {
    const wrapper = shallow(
      <VoteView
        positivePercentage={43}
        votesCount={{
          FOR: 12,
          AGAINST: 15,
        }}
        isMobile
      />,
    )
    expect(wrapper).toMatchSnapshot()
  })
})
