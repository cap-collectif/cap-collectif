/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'
import MultipleCheckbox from './MultipleCheckbox'
import { TYPE_FORM } from '~/constants/FormConstants'

const baseProps = {
  id: '1',
  typeForm: TYPE_FORM.DEFAULT,
  field: {
    id: '123',
    type: 'checkbox',
    isOtherAllowed: false,
    choices: [
      {
        id: '1',
        label: 'Pomme',
      },
      {
        id: '2',
        label: 'Poire',
      },
    ],
    checked: false,
    helpText: "Ceci est un texte d'aide",
    description: 'Ceci est une description',
  },
  onChange: jest.fn(),
  onBlur: jest.fn(),
  disabled: false,
  value: {
    labels: [],
    other: null,
  },
}
const props = {
  basic: { ...baseProps },
  disabled: { ...baseProps, disabled: true },
  inQuestionnaire: { ...baseProps, typeForm: TYPE_FORM.QUESTIONNAIRE },
}
describe('<MultipleCheckbox />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<MultipleCheckbox {...props.basic} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when disabled', () => {
    const wrapper = shallow(<MultipleCheckbox {...props.disabled} />)
    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly when in questionnaire form', () => {
    const wrapper = shallow(<MultipleCheckbox {...props.inQuestionnaire} />)
    expect(wrapper).toMatchSnapshot()
  })
})
