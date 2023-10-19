/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import { ChangeUsername } from './ChangeUsername'
import { intlMock, formMock, $refType } from '../../../mocks'

describe('<ChangeUsername />', () => {
  const props = {
    ...formMock,
    intl: intlMock,
    viewer: {
      id: 'user1',
      username: 'toto',
      ' $refType': $refType,
    },
    formValues: {
      username: 'username',
    },
  }
  it('it should render', () => {
    const wrapper = shallow(<ChangeUsername {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
