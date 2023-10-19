/* eslint-env jest */
import * as React from 'react'
import { shallow } from 'enzyme'
import { GroupAdminParameters } from './GroupAdminParameters'
import { $refType } from '../../../mocks'

describe('<GroupAdminParameters />', () => {
  const props = {
    group: {
      ' $refType': $refType,
      id: 'group4',
      title: 'Comité de suvi',
      description: 'Lorem ipsum dolor sit amet sapien estiam',
      isUsedInEmailing: false,
    },
    submitting: false,
    submit: () => {},
    invalid: false,
    pristine: false,
    valid: false,
    submitSucceeded: false,
    submitFailed: false,
  }
  it('render correctly', () => {
    const wrapper = shallow(<GroupAdminParameters {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('render correctly with disabled button', () => {
    const disabled = { ...props, group: { ...props.group, isUsedInEmailing: true } }
    const wrapper = shallow(<GroupAdminParameters {...disabled} />)
    expect(wrapper).toMatchSnapshot()
  })
})
