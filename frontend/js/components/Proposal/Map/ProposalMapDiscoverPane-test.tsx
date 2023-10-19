/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { Pane as ProposalMapDiscoverPane } from './ProposalMapDiscoverPane'
import { intlMock } from '~/mocks'

describe('<ProposalMapDiscoverPane />', () => {
  it('should render correctly', () => {
    const props = {
      intl: intlMock,
      type: 'CLICK',
    }
    const wrapper = shallow(<ProposalMapDiscoverPane {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
