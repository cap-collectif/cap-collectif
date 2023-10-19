/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import FileUpload from './FileUpload'
import { TYPE_FORM } from '~/constants/FormConstants'

const baseProps = {
  id: '123',
  typeForm: TYPE_FORM.DEFAULT,
  onChange: jest.fn(),
  disabled: false,
  value: [
    {
      id: '1',
      name: 'huhu.pdf',
      size: '12ko',
      url: 'huhu.com/huhu.pdf',
    },
    {
      id: '2',
      name: 'haha.doc',
      size: '11ko',
      url: 'haha.com/haha.doc',
    },
  ],
}
const props = {
  basic: { ...baseProps },
  noValue: { ...baseProps, value: null },
  disabled: { ...baseProps, disabled: true },
  inQuestionnaire: { ...baseProps, typeForm: TYPE_FORM.QUESTIONNAIRE },
}
describe('<FileUpload />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<FileUpload {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when no value', () => {
    const wrapper = shallow(<FileUpload {...props.noValue} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when disabled', () => {
    const wrapper = shallow(<FileUpload {...props.disabled} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when in questionnaire form', () => {
    const wrapper = shallow(<FileUpload {...props.inQuestionnaire} />)
    expect(wrapper).toMatchSnapshot()
  })
})
