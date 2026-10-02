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
/**
 * @jest-status legacy
 * @jest-reason Uses the historical Enzyme renderer and component-tree or instance assertions instead of
 * public DOM behavior.
 */
describe('<ModalArgumentAuthorMenu />', () => {
  it('should renders correcty', () => {
    const wrapper = shallow(<ModalArgumentAuthorMenu {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
