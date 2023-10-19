/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { OpinionSource } from './OpinionSource'
import { $refType, $fragmentRefs } from '../../../mocks'

describe('<OpinionSource />', () => {
  const sourceable = {
    id: 'sourceableId',
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
  }
  const sourceUserVip = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    author: {
      id: 'author1',
      displayName: 'author1',
      vip: true,
      media: null,
      url: 'https://capco/dev/profile/author1',
    },
    id: '1',
  }
  const sourceUserNotVip = {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
    author: {
      id: 'author1',
      displayName: 'author1',
      vip: false,
      media: null,
      url: 'https://capco/dev/profile/author1',
    },
    id: '1',
  }
  it('should render a li bordered', () => {
    const wrapper = shallow(<OpinionSource sourceable={sourceable} source={sourceUserVip} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render a white li if not vip', () => {
    const wrapper = shallow(<OpinionSource sourceable={sourceable} source={sourceUserNotVip} />)
    expect(wrapper).toMatchSnapshot()
  })
})
