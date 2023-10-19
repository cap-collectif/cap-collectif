/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { ModalArgumentAuthorMenu } from './ModalArgumentAuthorMenu'
import { $refType, $fragmentRefs } from '~/mocks'

const props = {
  argument: {
    ' $refType': $refType,
    ' $fragmentRefs': $fragmentRefs,
  },
}
describe('<ModalArgumentAuthorMenu />', () => {
  it('should renders correcty', () => {
    const wrapper = shallow(<ModalArgumentAuthorMenu {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
