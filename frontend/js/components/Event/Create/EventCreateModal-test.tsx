/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { EventCreateModal } from './EventCreateModal'
import { $refType, $fragmentRefs } from '~/mocks'

describe('<EventCreateModal />', () => {
  it('it renders correctly', () => {
    const props = {
      show: false,
      invalid: true,
      submitting: false,
      pristine: false,
      handleClose: jest.fn(),
      dispatch: jest.fn(),
      event: {
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
      query: {
        ' $fragmentRefs': $fragmentRefs,
        ' $refType': $refType,
      },
    }
    const wrapper = shallow(<EventCreateModal {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
