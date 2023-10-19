/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { EventLabelStatus } from './EventLabelStatus'
import { $refType } from '~/mocks'

describe('<EventLabelStatus />', () => {
  const propsRefused = {
    event: {
      review: {
        id: 'review11',
        status: 'REFUSED',
        refusedReason: 'SPAM',
      },
      ' $refType': $refType,
    },
  }
  const propsApproved = {
    event: {
      review: {
        id: 'review11',
        status: 'APPROVED',
        refusedReason: 'NONE',
      },
      ' $refType': $refType,
    },
  }
  const propsAwaiting = {
    event: {
      review: {
        id: 'review11',
        status: 'AWAITING',
        refusedReason: 'NONE',
      },
      ' $refType': $refType,
    },
  }
  it('renders correcty event refused', () => {
    const wrapper = shallow(<EventLabelStatus {...propsRefused} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correcty event approved ', () => {
    const wrapper = shallow(<EventLabelStatus {...propsApproved} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('renders correcty event event waiting', () => {
    const wrapper = shallow(<EventLabelStatus {...propsAwaiting} />)
    expect(wrapper).toMatchSnapshot()
  })
})
